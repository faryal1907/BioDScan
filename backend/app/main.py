import os
import json
import uuid
import certifi
import logging
import asyncio
import random
from datetime import datetime
from typing import List, Optional, Dict, Any



from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
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

# Pydantic Model
class BeeData(BaseModel):
    id: Optional[str] = None
    hive_id: Optional[str]
    temperature: float
    humidity: float
    bumble_bee_count: int
    honey_bee_count: int
    lady_bug_count: int
    location: Optional[str] = None
    notes: Optional[str] = None
    timestamp: Optional[str] = None

# Save Sensor Data
async def save_sensor_data_to_db(bee_data: BeeData):
    try:
        if database:
            collection = database.bee_data
            if not (10 <= bee_data.temperature <= 30 and 30 <= bee_data.humidity <= 90):
                logger.warning("❌ Invalid data skipped")
                return
            result = await collection.insert_one(bee_data.dict(exclude={'id'}))
            logger.info(f"✅ Sensor data saved to MongoDB with ID: {result.inserted_id}")
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
            bee_data = BeeData(**data)
            if not bee_data.timestamp:
                bee_data.timestamp = datetime.utcnow().isoformat()
            asyncio.run_coroutine_threadsafe(save_sensor_data_to_db(bee_data), loop)
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

    def publish(self, topic: str, data: Dict[str, Any]):
        if self.is_connected:
            try:
                payload = json.dumps(data)
                result = self.client.publish(topic, payload, qos=1)
                if result.rc == mqtt.MQTT_ERR_SUCCESS:
                    logger.info(f"📡 Published to {topic}: {payload}")
                else:
                    logger.error("❌ Publish failed")
            except Exception as e:
                logger.error(f"❌ Publish error: {e}")
        else:
            logger.warning("⚠️ MQTT not connected")

mqtt_service = MQTTService()

# Simulated Bee Data
def generate_bee_data(num_records: int = 5) -> List[Dict[str, Any]]:
    records = []
    now = datetime.utcnow()
    hour = now.hour
    base_temp = 20 + 8 * (1 if 8 <= hour <= 18 else -1) * random.uniform(0.5, 1)
    for i in range(num_records):
        temperature = round(random.uniform(max(10, base_temp - 8), min(30, base_temp + 8)), 2)
        base_humidity = 70 - (temperature - 20) * 2
        humidity = round(random.uniform(max(30, base_humidity - 20), min(90, base_humidity + 20)), 2)
        bee_factor = 1.5 if 8 <= hour <= 18 else 0.5
        records.append({
            "hive_id": f"HIVE-{i+1:03d}",
            "temperature": temperature,
            "humidity": humidity,
            "bumble_bee_count": random.randint(0, int(5 * bee_factor)),
            "honey_bee_count": random.randint(0, int(10 * bee_factor)),
            "lady_bug_count": random.randint(0, int(2 * bee_factor)),
            "location": "North Field",
            "notes": f"Simulated reading for HIVE-{i+1:03d}",
            "timestamp": now.isoformat()
        })
    return records

# API Routes
@app.get("/")
async def home():
    return {"message": "Bio-D-Scan API Running"}

@app.get("/api/bee-data", response_model=List[BeeData])
async def get_bee_data(limit: int = 10):
    try:
        if database:
            collection = database.bee_data
            cursor = collection.find().sort("timestamp", -1).limit(limit)
            docs = await cursor.to_list(length=limit)
            return [
                BeeData(
                    id=str(doc["_id"]),
                    hive_id=doc.get("hive_id", ""),
                    temperature=doc.get("temperature", 0),
                    humidity=doc.get("humidity", 0),
                    bumble_bee_count=doc.get("bumble_bee_count", 0),
                    honey_bee_count=doc.get("honey_bee_count", 0),
                    lady_bug_count=doc.get("lady_bug_count", 0),
                    location=doc.get("location", ""),
                    notes=doc.get("notes", ""),
                    timestamp=doc.get("timestamp", "")
                )
                for doc in docs if 10 <= doc.get("temperature", 0) <= 30 and 30 <= doc.get("humidity", 0) <= 90
            ]
    except Exception as e:
        logger.error(f"❌ Failed to get bee data: {e}")
    return []

@app.get("/api/external-bee-data", response_model=Dict[str, Any])
async def publish_and_return_data():
    data = generate_bee_data()
    for d in data:
        mqtt_service.publish(TOPIC, d)
    await asyncio.sleep(1)
    return {"success": True, "data": data}

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
