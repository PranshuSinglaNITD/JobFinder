import pandas as pd
import pickle
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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

if __name__ == "__main__":
    import uvicorn
    # Run on port 8000 to avoid conflict with Next.js (port 3000)
    uvicorn.run(app, host="0.0.0.0", port=8000)