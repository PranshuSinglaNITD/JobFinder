from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import threading

# Import the modular routers
from routers import ml, agent
from routers.worker import start_worker_loop

# Load Environment Variables FIRST
load_dotenv()

# Initialize the App
app = FastAPI(title="JobFinder AI API")

# 1. Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", # Keeps your local testing working
        "https://job-finder-blush.vercel.app"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    print("Booting up FastAPI Server...")
    # Launch the SQS worker in a daemon thread so it runs silently in the background
    worker_thread = threading.Thread(target=start_worker_loop, daemon=True)
    worker_thread.start()
    print("Background worker successfully injected into FastAPI!")


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