import mqtt, { MqttClient, IClientOptions } from 'mqtt';

export interface MQTTMessage {
    topic: string;
    payload: string;
    timestamp: Date;
}

export interface BeeData {
    id?: string;
    hive_id?: string;
    temperature: number;
    humidity: number;
    bumble_bee_count: number;
    honey_bee_count: number;
    lady_bug_count: number;
    location?: string;
    notes?: string;
    timestamp: string;
}

class MQTTService {
    private client: MqttClient | null = null;
    private isConnected = false;
    private messageHandlers: ((message: MQTTMessage) => void)[] = [];
    private connectionHandlers: ((connected: boolean) => void)[] = [];

    // HiveMQ Cloud configuration
    private config: IClientOptions = {
        host: process.env.NEXT_PUBLIC_MQTT_HOST || 'broker.hivemq.com',
        port: parseInt(process.env.NEXT_PUBLIC_MQTT_PORT || '1883'),
        protocol: 'mqtt',
        clientId: `bio-d-scan-${Math.random().toString(16).slice(3)}`,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
    };

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.client = mqtt.connect(this.config);

                this.client.on('connect', () => {
                    console.log('Connected to HiveMQ');
                    this.isConnected = true;
                    this.connectionHandlers.forEach(handler => handler(true));
                    resolve();
                });

                this.client.on('message', (topic, message) => {
                    const mqttMessage: MQTTMessage = {
                        topic,
                        payload: message.toString(),
                        timestamp: new Date()
                    };
                    
                    console.log('Received MQTT message:', mqttMessage);
                    this.messageHandlers.forEach(handler => handler(mqttMessage));
                });

                this.client.on('error', (error) => {
                    console.error('MQTT Error:', error);
                    this.isConnected = false;
                    this.connectionHandlers.forEach(handler => handler(false));
                    reject(error);
                });

                this.client.on('disconnect', () => {
                    console.log('Disconnected from HiveMQ');
                    this.isConnected = false;
                    this.connectionHandlers.forEach(handler => handler(false));
                });

            } catch (error) {
                console.error('Failed to connect to MQTT:', error);
                reject(error);
            }
        });
    }

    disconnect(): void {
        if (this.client) {
            this.client.end();
            this.client = null;
            this.isConnected = false;
        }
    }

    subscribe(topic: string): void {
        if (this.client && this.isConnected) {
            this.client.subscribe(topic, (err) => {
                if (err) {
                    console.error('Failed to subscribe to topic:', topic, err);
                } else {
                    console.log('Subscribed to topic:', topic);
                }
            });
        }
    }

    unsubscribe(topic: string): void {
        if (this.client && this.isConnected) {
            this.client.unsubscribe(topic);
        }
    }

    publish(topic: string, message: string): void {
        if (this.client && this.isConnected) {
            this.client.publish(topic, message);
        }
    }

    onMessage(handler: (message: MQTTMessage) => void): void {
        this.messageHandlers.push(handler);
    }

    onConnectionChange(handler: (connected: boolean) => void): void {
        this.connectionHandlers.push(handler);
    }

    getConnectionStatus(): boolean {
        return this.isConnected;
    }
}

// Create a singleton instance
const mqttService = new MQTTService();
export default mqttService; 