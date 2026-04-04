from fastapi import APIRouter, FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import pandas as pd
import PyPDF2
import docx
import io
import os
import json
from dotenv import load_dotenv

# Existing ML / Resume Imports
from google import genai
from google.genai import types

# NEW: LangGraph Tool Calling Imports
from typing import List, Dict, Annotated
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from typing_extensions import TypedDict
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_core.runnables.config import RunnableConfig

app = FastAPI()

# 1. Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 🧠 SECTION 1: EXISTING ML & RESUME LOGIC (Intact)
# ==========================================
try:
    with open('model.pkl', 'rb') as f:
        model = pickle.load(f)
    df = pd.read_csv('sal.csv')
    print("✅ Model and Data loaded successfully.")
except Exception as e:
    print(f"Error loading files: {e}")
    model = None
    df = None

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

load_dotenv()
apiKey = os.getenv('GEMINI_API_KEY')
client = genai.Client(api_key=apiKey)

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
            text = file_content.decode("utf-8")
    except Exception as e:
        return "" 
    return text

def analyzeResume(resumeText, jobDesc):
    if not resumeText or not jobDesc:
        return {'score':0,'analysis':'resume or job description not found'}
    prompt = f"""
    You are an expert technical recruiter and hiring manager.
    Analyze the following RESUME against the JOB DESCRIPTION.
    1. Calculate a match score from 0 to 100 based on how well the candidate's skills and experience fit the role.
    2. Provide a short, 2-3 sentence analysis highlighting their biggest strength and biggest missing requirement.
    JOB DESCRIPTION:\n{jobDesc}\n\nRESUME:\n{resumeText}
    """
    try:
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema={
                    "type": "OBJECT",
                    "properties": {
                        "score": {"type": "INTEGER", "description": "The match score from 0 to 100"},
                        "analysis": {"type": "STRING", "description": "A 2-3 sentence explanation of the score"}
                    },
                    "required": ["score", "analysis"]
                }
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        return {"score": 0, "analysis": "Error analyzing resume due to server timeout."}

@app.get("/")
def home():
    return {"message": "Salary Prediction API is running"}

@app.get("/api/meta")
def get_meta():
    return get_model_metadata()

@app.post("/api/predict")
def predict(data: dict):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    try:
        input_df = pd.DataFrame([data])
        prediction = model.predict(input_df)
        return {"salary": float(prediction[0])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post('/api/match-resume')
async def matchResume(resume:UploadFile=File(...), jobDesc:str=Form(...)):
    try:
        content=await resume.read()
        resumeText=extract_text(content,resume.filename)
        if len(resumeText) < 50:
            return {"error": "Could not extract enough text from resume."}
        ai_result = analyzeResume(resumeText, jobDesc)
        return {
            "score": ai_result.get("score", 0),
            "feedback": ai_result.get("analysis", "AI analysis unavailable.")
        }
    except Exception as e:
        return {"error": "An internal server error occurred while analyzing the resume."}

#ai agent
class JobBotRequest(BaseModel):
    chat_id: str
    message: str
    user_name: str
    resume_text: str
    jobs_context: str

# 1. State Definition (Only what changes goes here)
class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    user_name: str
    resume_text: str

# 2. THE TOOL (@tool)
@tool
def get_active_jobs(config: RunnableConfig) -> str:
    """Call this tool ONLY when the user asks about available jobs, open roles, salaries, or wants job recommendations.
    It retrieves the current active job listings from the company database."""
    # We securely grab the massive database string from the config to save prompt tokens
    return config["configurable"].get("jobs_context", "No active jobs found in the database.")

# 3. Setup LLM and bind the tools to it
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=apiKey)
tools = [get_active_jobs]
llm_with_tools = llm.bind_tools(tools)

# 4. The Core Agent Node
def chatbot_node(state: AgentState, config: RunnableConfig):
    sys_msg = SystemMessage(content=f"""
    You are JobBot, an elite AI Recruitment Specialist.
    Candidate Name: {state['user_name']}
    
    === CANDIDATE'S RESUME ===
    {state['resume_text']}
    
    INSTRUCTIONS:
    - If the user asks for jobs, call the 'get_active_jobs' tool to fetch the database, then match them to roles based on their resume.
    - If the user just says hello or makes small talk, DO NOT call the tool. Just chat politely.
    - Always use bullet points for job listings and be encouraging.
    """)
    
    # The LLM will automatically decide here if it should output a text response OR a tool call
    response = llm_with_tools.invoke([sys_msg] + state["messages"])
    return {"messages": [response]}

# 5. Build the Tool-Calling Graph
workflow = StateGraph(AgentState)

# Add the agent and the pre-built tool executor
workflow.add_node("chatbot", chatbot_node)
workflow.add_node("tools", ToolNode(tools))

# Build the edges (This is where the magic conditional routing happens automatically)
workflow.add_edge(START, "chatbot")
# If the LLM decides to call a tool, it routes to "tools". If it just replies, it routes to END.
workflow.add_conditional_edges("chatbot", tools_condition)
workflow.add_edge("tools", "chatbot") # After the tool runs, go back to the chatbot to read the results

# Add Memory
memory = MemorySaver()
jobbot_app = workflow.compile(checkpointer=memory)


#langgraph 
@app.post("/api/jobbot")
async def run_jobbot(req: JobBotRequest):
    try:
        # We pass the memory thread ID and the heavy database string in the config!
        config = {
            "configurable": {
                "thread_id": req.chat_id,
                "jobs_context": req.jobs_context 
            }
        }
        
        input_state = {
            "messages": [HumanMessage(content=req.message)],
            "user_name": req.user_name,
            "resume_text": req.resume_text
        }
        
        result = jobbot_app.invoke(input_state, config=config)
        ai_response = result["messages"][-1].content
        
        return {"reply": ai_response}
        
    except Exception as e:
        print(f"JobBot Error: {e}")
        raise HTTPException(status_code=500, detail="Error generating AI response")
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)