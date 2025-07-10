import ssl
import json
import logging
import os
from datetime import datetime
from typing import Dict, Any, Callable, Optional
from dotenv import load_dotenv
import uuid
import time  # also needed because you use time.sleep

load_dotenv()

import paho.mqtt.client as mqtt
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BeeData(BaseModel):
    date: str  # e.g., "2025-07-09"
    time: str  # e.g., "21:40:19"
    bumble_bee: int
    honey_bee: int
    lady_bug: int
    total_count: int
    temperature_c: float
    humidity_percent: float
    location: str

    @classmethod
    def from_raw(cls, raw: Dict[str, Any]):
        return cls(
            date=raw["Date"],
            time=raw["Time"],
            bumble_bee=raw["Bumble Bee"],
            honey_bee=raw["Honey Bee"],
            lady_bug=raw["Lady Bug"],
            total_count=raw["Total Count"],
            temperature_c=raw["Temperature (C)"],
            humidity_percent=raw["Humidity (%)"],
            location=raw["Location"]
        )


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