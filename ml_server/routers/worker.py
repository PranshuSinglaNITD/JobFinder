import os
import json
import time
import boto3
import pymongo # <-- NEW
from bson.objectid import ObjectId # <-- NEW
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# Initialize AWS, Gemini, and MongoDB
sqs = boto3.client('sqs', aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'), aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'), region_name=os.getenv('AWS_REGION', 'us-east-1'))
QUEUE_URL = os.getenv('SQS_QUEUE_URL')
client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

# Connect to MongoDB directly
mongo_client = pymongo.MongoClient(os.getenv("MONGO_URI"))
db = mongo_client["JobFinder"] # Gets the DB name from your URI
jobs_collection = db["jobs"] # Make sure this matches your MongoDB collection name (usually 'jobs')

def process_ranking_job(job_data):
    job_desc = job_data['job_description']
    candidates = job_data['candidates']
    job_id = job_data['job_id']
    
    print(f"⚙️ Processing {len(candidates)} candidates for Job {job_id}...")

    # --- 1. VECTOR MATH ---
    job_embedding_res = client.models.embed_content(model='gemini-embedding-001', contents=job_desc)
    job_vector = np.array(job_embedding_res.embeddings[0].values).reshape(1, -1)
    
    resume_texts = [cand['resumeText'][:5000] for cand in candidates]
    candidates_embed_res = client.models.embed_content(model='gemini-embedding-001', contents=resume_texts)
    candidate_vectors = np.array([e.values for e in candidates_embed_res.embeddings])

    similarity_scores = cosine_similarity(job_vector, candidate_vectors)[0]
    top_indices = similarity_scores.argsort()[-5:][::-1]

    # --- 2. GEMINI SUMMARIES ---
    ranked_results = []
    for idx in top_indices:
        candidate = candidates[idx]
        base_score = int(similarity_scores[idx] * 100)
        
        prompt = f"Write a 1-sentence summary of why this candidate fits. JOB:\n{job_desc}\n\nRESUME:\n{candidate['resumeText']}"
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json",
                response_schema={"type": "OBJECT", "properties": {"summary": {"type": "STRING"}}, "required": ["summary"]}
            ),
        )
        ai_result = json.loads(response.text)
        
        ranked_results.append({
            "candidateId": candidate["id"],
            "name": candidate["name"],
            "matchScore": base_score,
            "aiSummary": ai_result.get("summary", "")
        })

    # --- 3. SAVE TO MONGODB ---
    # This attaches the ranked candidates permanently to the Job posting!
    res=jobs_collection.update_one(
        {"_id": ObjectId(job_id)},
        {"$set": {"aiSuggestions": ranked_results}}
    )
    # print(db.name)
    if res.matched_count == 0:
        print(f"DATABASE ERROR: Job {job_id} was NOT FOUND in the 'JobFinder' database!")
        print("Your Next.js app is saving jobs somewhere else (probably 'test').")
    else:
        print(f"✅ SUCCESS: Results permanently saved to Job {job_id}!")

def poll_queue():
    print("🎧 Worker listening for SQS messages...")
    while True:
        try:
            response = sqs.receive_message(QueueUrl=QUEUE_URL, MaxNumberOfMessages=1, WaitTimeSeconds=10)
            if 'Messages' in response:
                message = response['Messages'][0]
                job_data = json.loads(message['Body'])
                
                process_ranking_job(job_data)
                
                sqs.delete_message(QueueUrl=QUEUE_URL, ReceiptHandle=message['ReceiptHandle'])
                print("🗑️ Message processed and deleted from SQS.")
        except Exception as e:
            print(f"Worker Error: {e}")
            time.sleep(5)

if __name__ == "__main__":
    poll_queue()