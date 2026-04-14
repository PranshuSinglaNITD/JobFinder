from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Annotated, Literal
import requests
import os

from langchain_core.tools import tool
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from typing_extensions import TypedDict
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_core.runnables.config import RunnableConfig

router = APIRouter()
apiKey = os.getenv('GEMINI_API_KEY')

# --- 1. SCHEMAS & STATE ---
class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    user_name: str
    resume_text: str

class JobData(BaseModel):
    title: str = Field(description="The job title, e.g., Software Engineer")
    location: str = Field(description="City or 'Remote'")
    salary: str = Field(description="Extracted salary or 'Not Specified'")
    skills: list[str] = Field(description="List of required technical skills")
    workMode: str = Field(description="Remote, Hybrid, or On-site")
    description: str = Field(description="A professional 2-paragraph expanded job description")

class ApplicationData(BaseModel):
    job_id: str = Field(description="The exact ID of the job from the database")
    tailored_cover_letter: str = Field(description="A short 3-sentence cover letter explaining why their resume matches")

# --- 2. TOOLS ---
@tool(args_schema=JobData)
def save_job_to_db(title: str, location: str, salary: str, skills: list[str], workMode: str, description: str) -> str:
    """Tool to save a fully formatted job posting to the database."""
    print(f"✅ SAVED TO DB: {title} | {skills} | {salary}")
    return f"Successfully created the job posting for {title}!"

@tool(args_schema=ApplicationData)
def submit_auto_application(job_id: str, tailored_cover_letter: str, config: RunnableConfig) -> str:
    """Call this tool ONLY when the user explicitly asks to apply for a job."""
    user_id = config["configurable"].get("user_id")
    # For Docker, you might want to use os.getenv("NEXTJS_API_URL", "http://127.0.0.1:3000") in the future!
    try:
        response = requests.post("http://127.0.0.1:3000/api/applications/ai-apply", json={
            "jobId": job_id, "userId": user_id, "coverLetter": tailored_cover_letter
        })
        if response.status_code == 200:
            print(f"🚀 SUCCESS: Saved to MongoDB! Applied for Job {job_id}")
            return "Successfully applied for the job and saved it to the database!"
        else:
            return "I tried to apply, but the database rejected it."
    except Exception as e:
        print(f"Database tool error: {e}")
        return "I encountered a network error while saving the application."

@tool
def get_active_jobs(config: RunnableConfig) -> str:
    """Call this tool ONLY when the user asks about available jobs or open roles."""
    return config["configurable"].get("jobs_context", "No active jobs found.")

# --- 3. NODES & ROUTING ---
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=apiKey)

def job_creator_node(state: AgentState):
    sys_msg = SystemMessage(content="""
    You are an AI Recruitment Assistant. Your job is to take messy notes from recruiters 
    and turn them into professional job postings. 
    You MUST call the 'save_job_to_db' tool to save the data once you have formatted it.
    """)
    llm_with_tools = llm.bind_tools([save_job_to_db])
    response = llm_with_tools.invoke([sys_msg] + state["messages"])
    return {"messages": [response]}

def chatbot_node(state: AgentState, config: RunnableConfig):
    sys_msg = SystemMessage(content=f"""
    You are JobBot, an elite AI Recruitment Specialist.
    Candidate Name: {state['user_name']}
    
    === CANDIDATE'S RESUME ===
    {state['resume_text']}
    
    INSTRUCTIONS & TOOLS:
    1. To search for open roles or get Job IDs, call the 'get_active_jobs' tool.
    2. If the user asks to APPLY for a specific job (e.g., "apply for backend developer"):
       - STEP 1: If you do not know the exact database job_id, call 'get_active_jobs' FIRST to find it.
       - STEP 2: Write a tailored 3-sentence cover letter based on their resume.
       - STEP 3: Call the 'submit_auto_application' tool using that 'job_id'.
       - Do not tell the user you can't find it without checking the 'get_active_jobs' tool first!
    3. Always be encouraging.
    """)
    llm_with_tools = llm.bind_tools([get_active_jobs, submit_auto_application])
    response = llm_with_tools.invoke([sys_msg] + state["messages"])
    return {"messages": [response]}

def route_query(state: AgentState) -> Literal["job_creator", "chatbot"]:
    last_message = state["messages"][-1].content
    router_prompt = f"""
    Does the following user message look like a request to CREATE a new job posting for a database?
    Message: "{last_message}"
    Reply strictly with "YES" or "NO".
    """
    decision = llm.invoke(router_prompt).content.strip().upper()
    return "job_creator" if "YES" in decision else "chatbot"

# --- 4. GRAPH COMPILATION ---
workflow = StateGraph(AgentState)
workflow.add_node("job_creator", job_creator_node)
workflow.add_node("chatbot", chatbot_node)
workflow.add_node("creator_tools", ToolNode([save_job_to_db]))
workflow.add_node("chatbot_tools", ToolNode([get_active_jobs, submit_auto_application]))

workflow.add_conditional_edges(START, route_query, {"job_creator": "job_creator", "chatbot": "chatbot"})
workflow.add_conditional_edges("job_creator", tools_condition, {"tools": "creator_tools", "__end__": END})
workflow.add_edge("creator_tools", "job_creator")
workflow.add_conditional_edges("chatbot", tools_condition, {"tools": "chatbot_tools", "__end__": END})
workflow.add_edge("chatbot_tools", "chatbot")

memory = MemorySaver()
jobbot_app = workflow.compile(checkpointer=memory)

# --- 5. API ROUTE ---
class JobBotRequest(BaseModel):
    chat_id: str
    message: str
    user_name: str
    user_id: str
    resume_text: str
    jobs_context: str

@router.post("/api/jobbot")
async def run_jobbot(req: JobBotRequest):
    try:
        config = {
            "configurable": {
                "thread_id": req.chat_id,
                "jobs_context": req.jobs_context,
                "user_id": req.user_id
            }
        }
        input_state = {
            "messages": [HumanMessage(content=req.message)],
            "user_name": req.user_name,
            "resume_text": req.resume_text
        }
        
        result = jobbot_app.invoke(input_state, config=config)
        ai_response = result["messages"][-1].content
        
        if isinstance(ai_response, list):
            text_parts = [block.get("text", "") for block in ai_response if "text" in block]
            ai_response = "\n".join(text_parts)
            
        return {"reply": ai_response}
    except Exception as e:
        print(f"JobBot Error: {e}")
        raise HTTPException(status_code=500, detail="Error generating AI response")