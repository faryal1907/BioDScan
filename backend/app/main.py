import json
import logging
import os
import random
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, List
from threading import Thread
import asyncio

import paho.mqtt.client as mqtt
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
logger.info("Loaded environment variables from .env file")

app = FastAPI(title="Bio-D-Scan Backend API", version="1.0.0")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB configuration
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb+srv://fkalibscs23seecs:Family%2A9366@cluster00.qjanftu.mongodb.net/bio-d-scan?retryWrites=true&w=majority")
DATABASE_NAME = os.getenv("DATABASE_NAME", "bee_monitoring")

# HiveMQ configuration
BROKER = os.getenv("MQTT_HOST", "0a4da080df9b471da9fe248f9965857e.s1.eu.hivemq.cloud")
PORT = int(os.getenv("MQTT_PORT", 8883))
TOPIC = os.getenv("MQTT_TOPIC", "sensors/bee-data")
USERNAME = os.getenv("MQTT_USERNAME", "faryal1907")
PASSWORD = os.getenv("MQTT_PASSWORD", "Family%2A9366")

# Global MongoDB client and event loop
mongodb_client = None
database = None
loop = asyncio.get_event_loop()

# Pydantic model
class BeeData(BaseModel):
    id: Optional[str] = None
    hive_id: Optional[str] = None
    temperature: float
    humidity: float
    bumble_bee_count: int
    honey_bee_count: int
    lady_bug_count: int
    location: Optional[str] = None
    notes: Optional[str] = None
    timestamp: Optional[str] = None

# MQTT Service
class MQTTService:
    def __init__(self):
        self.client = mqtt.Client(client_id=f"bio-d-scan-backend-{uuid.uuid4().hex[:8]}")
        self.is_connected = False
        self.client.username_pw_set(USERNAME, PASSWORD)
        self.client.tls_set()
        self.client.on_connect = self._on_connect
        self.client.on_disconnect = self._on_disconnect
        self.client.on_message = self._on_message
        self.client.on_publish = self._on_publish

    def _on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            logger.info("Connected to HiveMQ successfully")
            self.is_connected = True
            self.client.subscribe(TOPIC, qos=1)
        else:
            logger.error(f"Connection failed with code {rc}")
            self.is_connected = False

    def _on_disconnect(self, client, userdata, rc):
        logger.info(f"Disconnected from HiveMQ (code: {rc})")
        self.is_connected = False

    def _on_message(self, client, userdata, msg):
        try:
            data = json.loads(msg.payload.decode())
            logger.info(f"Received: {data}")
            bee_data = BeeData(**data)
            if not bee_data.timestamp:
                bee_data.timestamp = datetime.now().isoformat()
            # Run async save in the correct event loop
            asyncio.run_coroutine_threadsafe(save_sensor_data_to_db(bee_data), loop)
        except json.JSONDecodeError:
            logger.error("Failed to decode message")
        except Exception as e:
            logger.error(f"Error processing message: {e}")

    def _on_publish(self, client, userdata, mid):
        logger.debug(f"Message published with ID: {mid}")

    def connect(self):
        try:
            logger.info(f"Connecting to MQTT broker at {BROKER}:{PORT}")
            self.client.connect(BROKER, PORT, 60)
            self.client.loop_start()
        except Exception as e:
            logger.error(f"Failed to connect to MQTT broker: {e}")
            self.is_connected = False

    def disconnect(self):
        self.client.loop_stop()
        self.client.disconnect()
        self.is_connected = False
        logger.info("Disconnected from MQTT broker")

    def publish(self, topic: str, data: Dict[str, Any]):
        if self.is_connected:
            try:
                payload = json.dumps(data)
                result = self.client.publish(topic, payload, qos=1)
                if result.rc == mqtt.MQTT_ERR_SUCCESS:
                    logger.info(f"Published to {topic}: {payload}")
                else:
                    logger.error(f"Failed to publish to {topic}, error code: {result.rc}")
            except Exception as e:
                logger.error(f"Error publishing to {topic}: {e}")
        else:
            logger.error("Not connected to MQTT broker")

# Initialize MQTT service
mqtt_service = MQTTService()

# MongoDB connection functions
async def connect_to_mongodb():
    global mongodb_client, database
    try:
        logger.info(f"Connecting to MongoDB at {MONGODB_URL}")
        mongodb_client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
        await mongodb_client.admin.command('ping')
        logger.info("Connected to MongoDB successfully")
        database = mongodb_client[DATABASE_NAME]
        logger.info(f"Using database: {DATABASE_NAME}")
    except ConnectionFailure as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        database = None
    except Exception as e:
        logger.error(f"Unexpected error connecting to MongoDB: {e}")
        database = None

async def close_mongodb_connection():
    global mongodb_client
    if mongodb_client:
        mongodb_client.close()
        logger.info("MongoDB connection closed")

async def save_sensor_data_to_db(bee_data: BeeData):
    try:
        if database is not None:
            collection = database.bee_data
            # Validate data before saving
            if not (10 <= bee_data.temperature <= 30 and 30 <= bee_data.humidity <= 90):
                logger.warning(f"Invalid data not saved: {bee_data.dict()}")
                return
            result = await collection.insert_one(bee_data.dict(exclude={'id'}))
            logger.info(f"Sensor data saved to MongoDB with ID: {result.inserted_id}")
        else:
            logger.warning("MongoDB not available, skipping save")
    except Exception as e:
        logger.error(f"Error saving sensor data to database: {e}")

# Generate realistic bee data
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

# API endpoints
@app.get("/")
async def read_root():
    return {"message": "Bio-D-Scan Backend API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    mongodb_status = "connected" if database is not None else "disconnected"
    return {
        "status": "healthy",
        "mqtt_connected": mqtt_service.is_connected,
        "mongodb_connected": mongodb_status,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/bee-data", response_model=List[BeeData])
async def get_bee_data(limit: int = 10):
    try:
        if database is None:
            logger.warning("MongoDB not available, returning empty data")
            return []
        collection = database.bee_data
        cursor = collection.find().sort("timestamp", -1).limit(limit)
        results = await cursor.to_list(length=limit)
        formatted_results = []
        for result in results:
            if not (10 <= result.get("temperature", 0) <= 30 and 30 <= result.get("humidity", 0) <= 90):
                logger.warning(f"Skipping invalid MongoDB record: {result}")
                continue
            formatted_result = {
                "id": str(result["_id"]),
                "hive_id": result.get("hive_id", "unknown"),
                "temperature": result.get("temperature", 0),
                "humidity": result.get("humidity", 0),
                "bumble_bee_count": result.get("bumble_bee_count", 0),
                "honey_bee_count": result.get("honey_bee_count", 0),
                "lady_bug_count": result.get("lady_bug_count", 0),
                "location": result.get("location", ""),
                "notes": result.get("notes", ""),
                "timestamp": result.get("timestamp", "")
            }
            formatted_results.append(formatted_result)
        return formatted_results
    except Exception as e:
        logger.error(f"Error getting bee data: {e}")
        return []

@app.get("/api/external-bee-data", response_model=Dict[str, Any])
async def get_external_bee_data(limit: int = 10):
    try:
        # Generate and publish multiple records
        records = generate_bee_data(num_records=5)
        for data in records:
            mqtt_service.publish(TOPIC, data)
            logger.info(f"Generated and published data: {data}")

        # Wait briefly for MQTT messages to be processed
        await asyncio.sleep(0.5)

        # Fetch from MongoDB
        if database is None:
            logger.warning("MongoDB not available, returning generated data")
            return {"success": True, "data": records, "count": len(records), "timestamp": datetime.now().isoformat()}
        
        collection = database.bee_data
        cursor = collection.find().sort("timestamp", -1).limit(limit)
        results = await cursor.to_list(length=limit)
        formatted_results = []
        for result in results:
            if not (10 <= result.get("temperature", 0) <= 30 and 30 <= result.get("humidity", 0) <= 90):
                logger.warning(f"Skipping invalid MongoDB record: {result}")
                continue
            formatted_result = {
                "id": str(result["_id"]),
                "hive_id": result.get("hive_id", "unknown"),
                "temperature": result.get("temperature", 0),
                "humidity": result.get("humidity", 0),
                "bumble_bee_count": result.get("bumble_bee_count", 0),
                "honey_bee_count": result.get("honey_bee_count", 0),
                "lady_bug_count": result.get("lady_bug_count", 0),
                "location": result.get("location", ""),
                "notes": result.get("notes", ""),
                "timestamp": result.get("timestamp", "")
            }
            formatted_results.append(formatted_result)
        
        return {
            "success": True,
            "data": formatted_results,
            "count": len(formatted_results),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting external bee data: {e}")
        return {"success": False, "error": str(e), "data": [], "count": 0}

@app.on_event("startup")
async def startup_event():
    logger.info("Starting Bio-D-Scan backend...")
    await connect_to_mongodb()
    mqtt_service.connect()

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down Bio-D-Scan backend...")
    await close_mongodb_connection()
    mqtt_service.disconnect()