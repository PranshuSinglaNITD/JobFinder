from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import numpy as np
import pandas as pd
import PyPDF2
import docx
import io
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()

# 1. Enable CORS so Next.js (port 3000) can talk to this API (port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your Next.js URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Load Model & Data on Startup
try:
    with open('model.pkl', 'rb') as f:
        model = pickle.load(f)
    df = pd.read_csv('sal.csv')
    print("✅ Model and Data loaded successfully.")
except Exception as e:
    print(f"❌ Error loading files: {e}")
    model = None
    df = None

# 3. Helper to extract features dynamically
def get_model_metadata():
    if model is None:
        return {"error": "Model not loaded"}
    
    try:
        # Extract feature names from the pipeline steps
        # logic matches your streamlit code:
        num_features = model.named_steps['preprocessor'].transformers_[0][2]
        cat_features = model.named_steps['preprocessor'].transformers_[1][2]
        
        # Build options for categorical features using the CSV data
        cat_options = {}
        for col in cat_features:
            if col in df.columns:
                # Get unique values and filter out NaNs
                options = df[col].dropna().unique().tolist()
                cat_options[col] = options if len(options) > 0 else ['unknown']
            else:
                cat_options[col] = ['unknown']

        return {
            "numerical": num_features,
            "categorical": cat_options 
        }
    except Exception as e:
        return {"error": str(e)}
    

def extract_text(file_content, filename):
    text = ""
    try:
        if filename.endswith(".pdf"):
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            for page in pdf_reader.pages:
                text += page.extract_text() or ""
        elif filename.endswith(".docx"):
            doc = docx.Document(io.BytesIO(file_content))
            for para in doc.paragraphs:
                text += para.text + "\n"
        else:
            # Attempt to decode as text/txt
            text = file_content.decode("utf-8")
    except Exception as e:
        return "" 
    return text

def calculate_similarity(resume_text, job_desc):
    if not resume_text or not job_desc:
        return 0
    
    # Create corpus
    text_corpus = [resume_text, job_desc]
    
    # Vectorize (TF-IDF)
    cv = TfidfVectorizer(stop_words='english')
    try:
        count_matrix = cv.fit_transform(text_corpus)
        # Cosine Similarity
        match_percentage = cosine_similarity(count_matrix)[0][1] * 100
        return round(match_percentage, 2)
    except:
        return 0

# --- ROUTES ---

@app.get("/")
def home():
    return {"message": "Salary Prediction API is running"}

@app.get("/api/meta")
def get_meta():
    """Returns the form fields and dropdown options"""
    return get_model_metadata()

@app.post("/api/predict")
def predict(data: dict):
    """
    Accepts JSON inputs, converts to DataFrame, and returns prediction.
    """
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    try:
        # Convert JSON input to DataFrame (Expecting a single row)
        input_df = pd.DataFrame([data])
        
        # Make Prediction
        prediction = model.predict(input_df)
        
        return {"salary": float(prediction[0])}
    except Exception as e:
        print(f"Prediction Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/api/match-resume")
async def match_resume(
    resume: UploadFile = File(...), 
    job_description: str = Form(...)
):
    try:
        # 1. Read File
        content = await resume.read()
        resume_text = extract_text(content, resume.filename)
        
        if len(resume_text) < 50:
            return {"error": "Could not extract enough text from resume."}

        # 2. Run NLP Model
        score = calculate_similarity(resume_text, job_description)
        
        # 3. Generate Feedback
        feedback = ""
        if score > 75:
            feedback = "Excellent Match! Your resume hits most keywords."
        elif score > 50:
            feedback = "Good Match. Consider adding more specific technical terms."
        else:
            feedback = "Low Match. Your resume might be missing key skills listed in the description."

        return {
            "score": score,
            "feedback": feedback
        }
        
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    # Run on port 8000 to avoid conflict with Next.js (port 3000)
    uvicorn.run(app, host="0.0.0.0", port=8000)