import motor.motor_asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

# MongoDB Atlas connection (optional for local development)
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URI)
db = client.bee_monitoring  # Database name
bee_data_collection = db.bee_data  # Collection name

# Test database connection
async def test_connection():
    try:
        await client.admin.command('ping')
        print("✅ Connected to MongoDB!")
        return True
    except Exception as e:
        print(f"⚠️  MongoDB connection failed (using proxy data): {e}")
        return False