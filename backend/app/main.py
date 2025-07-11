import os
import json
import uuid
import certifi
import logging
import asyncio
from datetime import datetime
from typing import List, Optional, Dict, Any

from dotenv import load_dotenv
from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
import paho.mqtt.client as mqtt
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(title="Bio-D-Scan Backend API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment Variables
MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "bee_monitoring")

BROKER = os.getenv("MQTT_HOST")
PORT = int(os.getenv("MQTT_PORT", 8883))
TOPIC = os.getenv("MQTT_TOPIC", "sensors/bee-data")
USERNAME = os.getenv("MQTT_USERNAME")
PASSWORD = os.getenv("MQTT_PASSWORD")

# Globals
mongodb_client = AsyncIOMotorClient(MONGODB_URL, tlsCAFile=certifi.where())
database = None
loop = asyncio.get_event_loop()

# MongoDB Connection
async def connect_to_mongodb():
    global mongodb_client, database
    try:
        logger.info(f"Connecting to MongoDB at {MONGODB_URL}")
        mongodb_client = AsyncIOMotorClient(
            MONGODB_URL,
            serverSelectionTimeoutMS=5000,
            tls=True,
            tlsCAFile=certifi.where()
        )
        await mongodb_client.admin.command("ping")
        logger.info("✅ Connected to MongoDB successfully")
        database = mongodb_client[DATABASE_NAME]
    except ConnectionFailure as e:
        logger.error(f"❌ MongoDB connection failure: {e}")
        database = None
    except Exception as e:
        logger.error(f"❌ Unexpected MongoDB error: {e}")
        database = None

async def close_mongodb_connection():
    global mongodb_client
    if mongodb_client:
        mongodb_client.close()
        logger.info("MongoDB connection closed")

# Save Sensor Data (Raw)
async def save_raw_data_to_db(data: Dict[str, Any]):
    try:
        if database is not None:
            collection = database.bee_data
            result = await collection.insert_one(data)
            logger.info(f"✅ Raw sensor data saved to MongoDB with ID: {result.inserted_id}")
        else:
            logger.warning("❌ MongoDB unavailable")
    except Exception as e:
        logger.error(f"❌ Error saving to DB: {e}")

# MQTT Service
class MQTTService:
    def __init__(self):
        self.client = mqtt.Client(client_id=f"bio-d-scan-{uuid.uuid4().hex[:8]}")
        self.is_connected = False
        self.client.username_pw_set(USERNAME, PASSWORD)
        self.client.tls_set()
        self.client.on_connect = self._on_connect
        self.client.on_disconnect = self._on_disconnect
        self.client.on_message = self._on_message

    def _on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            logger.info("✅ Connected to HiveMQ successfully")
            self.is_connected = True
            self.client.subscribe(TOPIC, qos=1)
        else:
            logger.error(f"❌ HiveMQ connection failed with code {rc}")

    def _on_disconnect(self, client, userdata, rc):
        logger.warning(f"🔌 Disconnected from HiveMQ with code {rc}")
        self.is_connected = False

    def _on_message(self, client, userdata, msg):
        try:
            data = json.loads(msg.payload.decode())
            asyncio.run_coroutine_threadsafe(save_raw_data_to_db(data), loop)
        except Exception as e:
            logger.error(f"❌ MQTT message error: {e}")

    def connect(self):
        try:
            logger.info(f"Connecting to MQTT broker at {BROKER}:{PORT}")
            self.client.connect(BROKER, PORT, 60)
            self.client.loop_start()
        except Exception as e:
            logger.error(f"❌ Failed to connect to MQTT broker: {e}")

    def disconnect(self):
        self.client.loop_stop()
        self.client.disconnect()

mqtt_service = MQTTService()

# API Routes
@app.get("/")
async def home():
    return {"message": "Bio-D-Scan API Running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "mqtt_connected": mqtt_service.is_connected,
        "mongodb_connected": database is not None,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.on_event("startup")
async def on_startup():
    logger.info("🚀 Starting backend...")
    await connect_to_mongodb()
    mqtt_service.connect()

@app.on_event("shutdown")
async def on_shutdown():
    logger.info("🛑 Shutting down backend...")
    await close_mongodb_connection()
    mqtt_service.disconnect()
