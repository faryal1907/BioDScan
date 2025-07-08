import json
import logging
import os
import time
import uuid
from datetime import datetime
from typing import Dict, Any, Callable, Optional

import paho.mqtt.client as mqtt
from fastapi import FastAPI
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
    logger = logging.getLogger(__name__)
    logger.info("Loaded environment variables from .env file")
except ImportError:
    logger = logging.getLogger(__name__)
    logger.info("python-dotenv not installed, using system environment variables")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# MongoDB configuration
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "bee_monitoring")

# Global MongoDB client
mongodb_client = None
database = None

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
    timestamp: str

class MQTTService:
    def __init__(self):
        self.client = mqtt.Client(client_id=f"bio-d-scan-backend-{uuid.uuid4().hex[:8]}")
        self.is_connected = False
        self.message_handlers: Dict[str, Callable] = {}
        self.connection_handlers: list[Callable] = []
        
        # HiveMQ Cloud configuration
        self.host = os.getenv('MQTT_HOST', 'broker.hivemq.com')
        self.port = int(os.getenv('MQTT_PORT', '1883'))
        self.username = os.getenv('MQTT_USERNAME')
        self.password = os.getenv('MQTT_PASSWORD')
        self.topic = os.getenv('MQTT_TOPIC', 'sensors/bee-data')
        # For HiveMQ Cloud, always use TLS on port 8883
        self.use_tls = self.port == 8883
        
        # Set up callbacks
        self.client.on_connect = self._on_connect
        self.client.on_disconnect = self._on_disconnect
        self.client.on_message = self._on_message
        self.client.on_publish = self._on_publish
        self.client.on_subscribe = self._on_subscribe
        
        # Configure authentication if provided
        if self.username and self.password:
            self.client.username_pw_set(self.username, self.password)
            logger.info(f"MQTT authentication configured for user: {self.username}")
        
        # Configure TLS if required
        if self.use_tls:
            self.client.tls_set()
            logger.info("MQTT TLS enabled")
    
    def _on_connect(self, client, userdata, flags, rc):
        """Callback when connected to MQTT broker"""
        if rc == 0:
            logger.info("Connected to HiveMQ successfully")
            self.is_connected = True
            for handler in self.connection_handlers:
                handler(True)
        else:
            error_messages = {
                1: "Connection refused - incorrect protocol version",
                2: "Connection refused - invalid client identifier",
                3: "Connection refused - server unavailable",
                4: "Connection refused - bad username or password",
                5: "Connection refused - not authorised"
            }
            error_msg = error_messages.get(rc, f"Unknown error code: {rc}")
            logger.error(f"Failed to connect to HiveMQ: {error_msg}")
            self.is_connected = False
    
    def _on_disconnect(self, client, userdata, rc):
        """Callback when disconnected from MQTT broker"""
        if rc != 0:
            logger.warning(f"Unexpected disconnection from HiveMQ (code: {rc})")
        else:
            logger.info("Disconnected from HiveMQ")
        self.is_connected = False
        for handler in self.connection_handlers:
            handler(False)
    
    def _on_message(self, client, userdata, msg):
        """Callback when message is received"""
        try:
            topic = msg.topic
            payload = msg.payload.decode('utf-8')
            logger.info(f"Received message on topic {topic}: {payload}")
            
            # Parse JSON payload
            data = json.loads(payload)
            
            # Call registered handler for this topic
            if topic in self.message_handlers:
                self.message_handlers[topic](data)
            else:
                logger.warning(f"No handler registered for topic: {topic}")
                
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON message: {e}")
        except Exception as e:
            logger.error(f"Error processing message: {e}")
    
    def _on_publish(self, client, userdata, mid):
        """Callback when message is published"""
        logger.debug(f"Message published with ID: {mid}")
    
    def _on_subscribe(self, client, userdata, mid, granted_qos):
        """Callback when subscribed to topic"""
        logger.info(f"Subscribed to topic with QoS: {granted_qos}")
    
    def connect(self) -> bool:
        """Connect to MQTT broker"""
        try:
            logger.info(f"Connecting to MQTT broker at {self.host}:{self.port}")
            if self.username:
                logger.info(f"Using authentication with username: {self.username}")
            if self.use_tls:
                logger.info("Using TLS encryption")
            
            # Connect with keep-alive of 60 seconds
            self.client.connect(self.host, self.port, 60)
            self.client.loop_start()
            
            # Wait for connection to establish
            max_wait = 10  # seconds
            wait_time = 0
            while not self.is_connected and wait_time < max_wait:
                time.sleep(0.5)
                wait_time += 0.5
            
            if not self.is_connected:
                logger.error("Failed to connect to MQTT broker within timeout")
                return False
            
            return True
        except Exception as e:
            logger.error(f"Failed to connect to MQTT broker: {e}")
            return False
    
    def disconnect(self):
        """Disconnect from MQTT broker"""
        if self.client:
            self.client.loop_stop()
            self.client.disconnect()
            self.is_connected = False
            logger.info("Disconnected from MQTT broker")
    
    def subscribe(self, topic: str, handler: Callable):
        """Subscribe to a topic with a message handler"""
        if self.is_connected:
            self.client.subscribe(topic)
            self.message_handlers[topic] = handler
            logger.info(f"Subscribed to topic: {topic}")
        else:
            logger.error("Not connected to MQTT broker")
    
    def unsubscribe(self, topic: str):
        """Unsubscribe from a topic"""
        if self.is_connected:
            self.client.unsubscribe(topic)
            if topic in self.message_handlers:
                del self.message_handlers[topic]
            logger.info(f"Unsubscribed from topic: {topic}")
    
    def publish(self, topic: str, data: Dict[str, Any]):
        """Publish data to a topic"""
        if self.is_connected:
            try:
                payload = json.dumps(data)
                result = self.client.publish(topic, payload)
                if result.rc == mqtt.MQTT_ERR_SUCCESS:
                    logger.info(f"Published to topic {topic}: {payload}")
                else:
                    logger.error(f"Failed to publish to topic {topic}, error code: {result.rc}")
            except Exception as e:
                logger.error(f"Error publishing to topic {topic}: {e}")
        else:
            logger.error("Not connected to MQTT broker")
    
    def publish_bee_data(self, bee_data: BeeData):
        """Publish bee data to the appropriate topic"""
        topic = self.topic or f"bio-d-scan/bee-data/{bee_data.hive_id or 'default'}"
        data = bee_data.dict()
        self.publish(topic, data)
    
    def on_connection_change(self, handler: Callable):
        """Register a handler for connection status changes"""
        self.connection_handlers.append(handler)
    
    def get_connection_status(self) -> bool:
        """Get current connection status"""
        return self.is_connected

# Create a singleton instance
mqtt_service = MQTTService()

# MongoDB connection functions
async def connect_to_mongodb():
    """Connect to MongoDB"""
    global mongodb_client, database
    try:
        logger.info(f"Connecting to MongoDB at {MONGODB_URL}")
        mongodb_client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
        
        # Test the connection with shorter timeout
        await mongodb_client.admin.command('ping')
        logger.info("Connected to MongoDB successfully")
        
        database = mongodb_client[DATABASE_NAME]
        logger.info(f"Using database: {DATABASE_NAME}")
        
        return True
    except ConnectionFailure as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        logger.info("Continuing without MongoDB connection...")
        return False
    except Exception as e:
        logger.error(f"Unexpected error connecting to MongoDB: {e}")
        logger.info("Continuing without MongoDB connection...")
        return False

async def close_mongodb_connection():
    """Close MongoDB connection"""
    global mongodb_client
    if mongodb_client:
        mongodb_client.close()
        logger.info("MongoDB connection closed")

async def get_database():
    """Get database instance"""
    return database

# Add some basic API endpoints
@app.get("/")
def read_root():
    return {"message": "Bio-D-Scan Backend API"}

@app.get("/health")
async def health_check():
    # Check MongoDB connection
    mongodb_status = "connected" if database else "disconnected"
    try:
        if mongodb_client:
            await mongodb_client.admin.command('ping')
            mongodb_status = "connected"
    except:
        mongodb_status = "disconnected"
    
    return {
        "status": "healthy",
        "mqtt_connected": mqtt_service.get_connection_status(),
        "mongodb_connected": mongodb_status,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/bee-data")
async def create_bee_data(bee_data: BeeData):
    """Create new bee data entry"""
    try:
        # Add timestamp if not provided
        if not bee_data.timestamp:
            bee_data.timestamp = datetime.now().isoformat()
        
        # Try to insert into MongoDB if available
        if database:
            collection = database.bee_data
            result = await collection.insert_one(bee_data.dict())
            logger.info(f"Bee data saved to MongoDB with ID: {result.inserted_id}")
        else:
            logger.warning("MongoDB not available, skipping database save")
        
        # Publish to MQTT
        mqtt_service.publish_bee_data(bee_data)
        
        return {"message": "Bee data processed", "mongodb_saved": database is not None}
    except Exception as e:
        logger.error(f"Error creating bee data: {e}")
        return {"error": str(e)}

@app.get("/bee-data")
async def get_bee_data(limit: int = 10, hive_id: str = None):
    """Get bee data entries"""
    try:
        if not database:
            return {"error": "Database not connected", "data": [], "count": 0}
        
        collection = database.bee_data
        query = {}
        if hive_id:
            query["hive_id"] = hive_id
        
        cursor = collection.find(query).sort("timestamp", -1).limit(limit)
        results = await cursor.to_list(length=limit)
        
        # Convert ObjectId to string
        for result in results:
            result["_id"] = str(result["_id"])
        
        return {"data": results, "count": len(results)}
    except Exception as e:
        logger.error(f"Error getting bee data: {e}")
        return {"error": str(e)}

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Starting up Bio-D-Scan backend...")
    
    # Connect to MongoDB
    await connect_to_mongodb()
    
    # Connect to MQTT
    mqtt_service.connect()

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down Bio-D-Scan backend...")
    
    # Close MongoDB connection
    await close_mongodb_connection()
    
    # Disconnect MQTT
    mqtt_service.disconnect()