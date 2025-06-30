from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router as api_router
from app.database import test_connection
import uvicorn

# Allow frontend origins
origins = [
    "http://localhost:3000",  # Next.js default
]

app = FastAPI(
    title="Bio D Scan API",
    description="Full Stack Bee Hive Data Management with FastAPI",
    version="1.0.0"
)

# CORS middleware to allow frontend to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes from app.api
app.include_router(api_router)

@app.get("/")
async def root():
    return {"message": "Bio D Scan API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.on_event("startup")
async def startup_event():
    await test_connection()

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)