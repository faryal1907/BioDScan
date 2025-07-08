from fastapi import APIRouter, HTTPException
from typing import List
from app.models import BeeDataCreate, BeeDataResponse
from app.database import bee_data_collection
from app.mqtt_service import mqtt_service, BeeData as MQTTBeeData
from datetime import datetime, timedelta
from bson import ObjectId
import random
import math

router = APIRouter()

# Initialize MQTT connection on startup
@router.on_event("startup")
async def startup_event():
    """Initialize MQTT connection when the app starts"""
    try:
        success = mqtt_service.connect()
        if success:
            # Subscribe to bee data topics
            mqtt_service.subscribe("bio-d-scan/bee-data/#", handle_mqtt_bee_data)
            print("MQTT service initialized successfully")
        else:
            print("Failed to initialize MQTT service")
    except Exception as e:
        print(f"Error initializing MQTT service: {e}")

@router.on_event("shutdown")
async def shutdown_event():
    """Clean up MQTT connection when the app shuts down"""
    mqtt_service.disconnect()

async def handle_mqtt_bee_data(data: dict):
    """Handle incoming MQTT bee data and store it in the database"""
    try:
        # Convert MQTT data to database format
        bee_data = {
            "hive_id": data.get("hive_id"),
            "temperature": data.get("temperature"),
            "humidity": data.get("humidity"),
            "bumble_bee_count": data.get("bumble_bee_count"),
            "honey_bee_count": data.get("honey_bee_count"),
            "lady_bug_count": data.get("lady_bug_count"),
            "location": data.get("location"),
            "notes": data.get("notes"),
            "timestamp": datetime.fromisoformat(data.get("timestamp")) if data.get("timestamp") else datetime.now()
        }
        
        # Store in database
        await bee_data_collection.insert_one(bee_data)
        print(f"Stored MQTT bee data for hive: {bee_data.get('hive_id')}")
        
    except Exception as e:
        print(f"Error handling MQTT bee data: {e}")

# Sample data generator for bee monitoring
def generate_sample_bee_data():
    """Generate believable sample bee monitoring data"""
    # Generate data for the last 30 days
    sample_data = []
    base_time = datetime.now() - timedelta(days=30)
    
    hive_ids = ["HIVE-001", "HIVE-002", "HIVE-003", "HIVE-004", "HIVE-005"]
    locations = ["North Field", "South Garden", "East Meadow", "West Orchard", "Central Park"]
    
    for i in range(720):  # 30 days * 24 hours
        timestamp = base_time + timedelta(hours=i)
        
        # Generate realistic temperature data (daily cycle)
        hour = timestamp.hour
        base_temp = 20  # Base temperature
        temp_variation = 8 * math.sin((hour - 6) * math.pi / 12)  # Daily cycle
        temperature = base_temp + temp_variation + random.uniform(-2, 2)
        
        # Generate realistic humidity data (inverse relationship with temperature)
        humidity = max(30, min(90, 70 - (temperature - 20) * 2 + random.uniform(-5, 5)))
        
        # Generate bee counts based on temperature and time of day
        # Bees are more active during warmer hours (8-18) and at optimal temperatures (15-25°C)
        is_active_hours = 8 <= hour <= 18
        temp_factor = max(0, min(1, (temperature - 10) / 15))  # Optimal temp around 25°C
        activity_factor = (1 if is_active_hours else 0.3) * temp_factor
        
        # Base counts with seasonal variation
        base_bumble = 3
        base_honey = 8
        base_lady = 2
        
        # Add variation based on activity
        bumble_bee_count = max(0, int(base_bumble * activity_factor + random.uniform(-1, 2)))
        honey_bee_count = max(0, int(base_honey * activity_factor + random.uniform(-2, 4)))
        lady_bug_count = max(0, int(base_lady * activity_factor + random.uniform(-1, 1)))
        
        hive_id = random.choice(hive_ids)
        location = random.choice(locations)
        
        sample_data.append({
            "id": f"sample_{i}",
            "hive_id": hive_id,
            "temperature": round(temperature, 1),
            "humidity": round(humidity, 1),
            "bumble_bee_count": bumble_bee_count,
            "honey_bee_count": honey_bee_count,
            "lady_bug_count": lady_bug_count,
            "location": location,
            "notes": f"Automated reading from {hive_id} - Activity level: {'High' if activity_factor > 0.7 else 'Medium' if activity_factor > 0.3 else 'Low'}",
            "timestamp": timestamp.isoformat()
        })
    
    return sample_data

@router.post("/api/bee-data", response_model=BeeDataResponse, status_code=201)
async def add_bee_data(data: BeeDataCreate):
    """Add new bee data to the database"""
    try:
        data_dict = data.model_dump()
        data_dict["timestamp"] = datetime.now()
        
        result = await bee_data_collection.insert_one(data_dict)
        
        # Get the inserted document
        inserted_data = await bee_data_collection.find_one({"_id": result.inserted_id})
        if inserted_data:
            inserted_data["id"] = str(inserted_data.pop("_id"))
            return BeeDataResponse(**inserted_data)
        else:
            raise HTTPException(status_code=500, detail="Failed to retrieve inserted data")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add bee data: {str(e)}")

@router.get("/api/bee-data", response_model=List[BeeDataResponse])
async def get_bee_data(limit: int = 1000):
    """Get bee data with optional limit"""
    try:
        cursor = bee_data_collection.find({}).sort("timestamp", -1).limit(limit)
        data = []
        async for document in cursor:
            document["id"] = str(document.pop("_id"))
            data.append(BeeDataResponse(**document))
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch bee data: {str(e)}")

@router.get("/api/bee-data/{hive_id}")
async def get_bee_data_by_hive(hive_id: str):
    """Get bee data for a specific hive"""
    try:
        cursor = bee_data_collection.find({"hive_id": hive_id}).sort("timestamp", -1)
        data = []
        async for document in cursor:
            document["id"] = str(document.pop("_id"))
            data.append(document)
        return {"hive_id": hive_id, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch hive data: {str(e)}")

@router.delete("/api/bee-data/{data_id}")
async def delete_bee_data(data_id: str):
    """Delete bee data by ID"""
    try:
        result = await bee_data_collection.delete_one({"_id": ObjectId(data_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Data not found")
        return {"message": "Data deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete data: {str(e)}")

@router.get("/api/stats")
async def get_stats():
    """Get statistics about bee data"""
    try:
        total_count = await bee_data_collection.count_documents({})
        
        # Get average temperature and humidity
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "avg_temperature": {"$avg": "$temperature"},
                    "avg_humidity": {"$avg": "$humidity"},
                    "min_temperature": {"$min": "$temperature"},
                    "max_temperature": {"$max": "$temperature"}
                }
            }
        ]
        
        stats = await bee_data_collection.aggregate(pipeline).to_list(1)
        
        return {
            "total_records": total_count,
            "averages": stats[0] if stats else {}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")

# Proxy endpoint to return sample data (for development/testing)
@router.get("/api/external-bee-data")
async def proxy_external_bee_data():
    """Return sample bee monitoring data for development/testing"""
    try:
        # Return sample data instead of fetching from external API
        sample_data = generate_sample_bee_data()
        return {
            "status": "success",
            "message": "Sample data generated for development",
            "data": sample_data,
            "count": len(sample_data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate sample data: {str(e)}")    

# MQTT-related endpoints
@router.get("/api/mqtt/status")
async def get_mqtt_status():
    """Get MQTT connection status"""
    return {
        "connected": mqtt_service.get_connection_status(),
        "host": mqtt_service.host,
        "port": mqtt_service.port,
        "client_id": mqtt_service.client_id
    }

@router.post("/api/mqtt/publish")
async def publish_mqtt_data(data: dict):
    """Publish data to MQTT topic"""
    try:
        topic = data.get("topic", "bio-d-scan/default")
        message = data.get("message", {})
        
        if not mqtt_service.get_connection_status():
            raise HTTPException(status_code=503, detail="MQTT not connected")
        
        mqtt_service.publish(topic, message)
        return {"message": "Data published successfully", "topic": topic}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to publish data: {str(e)}")

@router.post("/api/mqtt/publish-bee-data")
async def publish_bee_data_mqtt(data: BeeDataCreate):
    """Publish bee data to MQTT"""
    try:
        if not mqtt_service.get_connection_status():
            raise HTTPException(status_code=503, detail="MQTT not connected")
        
        # Convert to MQTT format
        mqtt_data = MQTTBeeData(
            hive_id=data.hive_id,
            temperature=data.temperature,
            humidity=data.humidity,
            bumble_bee_count=data.bumble_bee_count,
            honey_bee_count=data.honey_bee_count,
            lady_bug_count=data.lady_bug_count,
            location=data.location,
            notes=data.notes,
            timestamp=datetime.now().isoformat()
        )
        
        mqtt_service.publish_bee_data(mqtt_data)
        return {"message": "Bee data published to MQTT successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to publish bee data: {str(e)}")

@router.post("/api/mqtt/subscribe")
async def subscribe_mqtt_topic(data: dict):
    """Subscribe to MQTT topic"""
    try:
        topic = data.get("topic")
        if not topic:
            raise HTTPException(status_code=400, detail="Topic is required")
        
        if not mqtt_service.get_connection_status():
            raise HTTPException(status_code=503, detail="MQTT not connected")
        
        # For now, we'll use a simple handler that logs messages
        def message_handler(message_data):
            print(f"Received message on {topic}: {message_data}")
        
        mqtt_service.subscribe(topic, message_handler)
        return {"message": f"Subscribed to topic: {topic}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to subscribe: {str(e)}")    