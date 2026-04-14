from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Import the modular routers
from routers import ml, agent

# Load Environment Variables FIRST
load_dotenv()

# Initialize the App
app = FastAPI(title="JobFinder AI API")

# 1. Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Attach the Routers
app.include_router(ml.router)
app.include_router(agent.router)

# 3. Base Health Check
@app.get("/")
def home():
    return {"message": "JobFinder Python Backend is running smoothly."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)