from pydantic import BaseModel
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
import pandas as pd
import pickle
import json
import os
from google import genai
from dotenv import load_dotenv
from google.genai import types
from utils.text_parser import extract_text
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

load_dotenv()
# Initialize the router ONLY ONCE at the top
router = APIRouter() 

# --- LOAD MODELS & DATA ---
try:
    with open('model.pkl', 'rb') as f:
        model = pickle.load(f)
    df = pd.read_csv('sal.csv')
    print("✅ Model and Data loaded successfully.")
except Exception as e:
    print(f"Error loading files: {e}")
    model = None
    df = None

# --- SETUP GEMINI ---
apiKey = os.getenv('GEMINI_API_KEY')
client = genai.Client(api_key=apiKey)

def get_model_metadata():
    if model is None: return {"error": "Model not loaded"}
    try:
        num_features = model.named_steps['preprocessor'].transformers_[0][2]
        cat_features = model.named_steps['preprocessor'].transformers_[1][2]
        cat_options = {}
        for col in cat_features:
            if col in df.columns:
                options = df[col].dropna().unique().tolist()
                cat_options[col] = options if len(options) > 0 else ['unknown']
            else:
                cat_options[col] = ['unknown']
        return {"numerical": num_features, "categorical": cat_options }
    except Exception as e:
        return {"error": str(e)}

# --- ROUTES ---
@router.get("/api/meta")
def get_meta():
    return get_model_metadata()

@router.post("/api/predict")
def predict(data: dict):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    try:
        input_df = pd.DataFrame([data])
        prediction = model.predict(input_df)
        return {"salary": float(prediction[0])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/api/match-resume')
async def matchResume(resume: UploadFile = File(...), jobDesc: str = Form(...)):
    try:
        content = await resume.read()
        resumeText = extract_text(content, resume.filename)
        if len(resumeText) < 50:
            return {"error": "Could not extract enough text from resume."}
            
        prompt = f"""
        You are an expert technical recruiter and hiring manager.
        Analyze the following RESUME against the JOB DESCRIPTION.
        1. Calculate a match score from 0 to 100.
        2. Provide a short, 2-3 sentence analysis.
        JOB DESCRIPTION:\n{jobDesc}\n\nRESUME:\n{resumeText}
        """
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema={
                    "type": "OBJECT",
                    "properties": {
                        "score": {"type": "INTEGER"},
                        "analysis": {"type": "STRING"}
                    },
                    "required": ["score", "analysis"]
                }
            ),
        )
        ai_result = json.loads(response.text)
        return {
            "score": ai_result.get("score", 0),
            "feedback": ai_result.get("analysis", "AI analysis unavailable.")
        }
    except Exception as e:
        print(f"❌ ML PREDICTION CRASHED: {str(e)}")
        return {"error": "An internal server error occurred while analyzing the resume."}
    
class CandidateBatchRequest(BaseModel):
    job_description: str
    candidates: list[dict] 

@router.post("/api/rank-candidates")
async def rank_candidates(req: CandidateBatchRequest):
    try:
        if not req.candidates:
            return {"suggestions": []}

        job_embedding_res = client.models.embed_content(
            model='text-embedding-004',
            contents=req.job_description
        )
        job_vector = np.array(job_embedding_res.embeddings[0].values).reshape(1, -1)

        #We truncate to 5000 chars to stay within safe embedding token limits
        resume_texts = [cand['resumeText'][:5000] for cand in req.candidates]
        
        candidates_embed_res = client.models.embed_content(
            model='text-embedding-004',
            contents=resume_texts
        )
        candidate_vectors = np.array([e.values for e in candidates_embed_res.embeddings])

        similarity_scores = cosine_similarity(job_vector, candidate_vectors)[0]

        top_k = min(5, len(req.candidates))
        top_indices = similarity_scores.argsort()[-top_k:][::-1]

        ranked_results = []
        for idx in top_indices:
            candidate = req.candidates[idx]
            
            base_score = int(similarity_scores[idx] * 100)

            prompt = f"""
            You are a technical recruiter. Write a highly concise, 1-sentence summary 
            of why this candidate is a good fit for the job based on their resume.
            JOB DESCRIPTION:\n{req.job_description}\n\nRESUME:\n{candidate['resumeText']}
            """
            
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    api_version="v1alpha", 
                    response_mime_type="application/json",
                    response_schema={
                        "type": "OBJECT",
                        "properties": {
                            "summary": {"type": "STRING"}
                        },
                        "required": ["summary"]
                    }
                ),
            )
            ai_result = json.loads(response.text)
            
            ranked_results.append({
                "candidateId": candidate["id"],
                "name": candidate["name"],
                "matchScore": base_score, #use vector score
                "aiSummary": ai_result.get("summary", "Strong match based on semantic search.")
            })
            
        return {"suggestions": ranked_results}
        
    except Exception as e:
        print(f"Ranking Error: {e}")
        raise HTTPException(status_code=500, detail="Error ranking candidates") 

@router.post('/api/extract-text')
async def extract_resume_text(file: UploadFile = File(...)):
    try:
        content = await file.read()
        text = extract_text(content, file.filename)
        if len(text) < 50:
            raise HTTPException(status_code=400, detail="Could not extract enough text.")
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))