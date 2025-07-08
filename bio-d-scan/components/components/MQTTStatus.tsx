import React, { useEffect, useState } from 'react';
import mqttService, { MQTTMessage, BeeData } from '@/lib/mqtt';

interface MQTTStatusProps {
    onDataReceived?: (data: BeeData) => void;
}

const MQTTStatus: React.FC<MQTTStatusProps> = ({ onDataReceived }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<MQTTMessage[]>([]);
    const [subscribedTopics, setSubscribedTopics] = useState<string[]>([]);
    const [newTopic, setNewTopic] = useState('bio-d-scan/bee-data/#');

    useEffect(() => {
        // Set up connection status handler
        mqttService.onConnectionChange((connected) => {
            setIsConnected(connected);
        });

        // Set up message handler
        mqttService.onMessage((message) => {
            setMessages(prev => [message, ...prev.slice(0, 9)]); // Keep last 10 messages
            
            // Try to parse as bee data
            try {
                const data = JSON.parse(message.payload);
                if (data.temperature !== undefined && data.humidity !== undefined) {
                    onDataReceived?.(data as BeeData);
                }
            } catch (error) {
                console.log('Message is not bee data format');
            }
        });

        // Connect to MQTT
        const connectMQTT = async () => {
            try {
                await mqttService.connect();
                // Subscribe to default topic
                mqttService.subscribe('bio-d-scan/bee-data/#');
                setSubscribedTopics(['bio-d-scan/bee-data/#']);
            } catch (error) {
                console.error('Failed to connect to MQTT:', error);
            }
        };

        connectMQTT();

        // Cleanup on unmount
        return () => {
            mqttService.disconnect();
        };
    }, [onDataReceived]);

    const handleSubscribe = () => {
        if (newTopic.trim()) {
            mqttService.subscribe(newTopic.trim());
            setSubscribedTopics(prev => [...prev, newTopic.trim()]);
            setNewTopic('');
        }
    };

    const handleUnsubscribe = (topic: string) => {
        mqttService.unsubscribe(topic);
        setSubscribedTopics(prev => prev.filter(t => t !== topic));
    };

    const handlePublish = () => {
        const testMessage = {
            hive_id: 'TEST-HIVE',
            temperature: 22.5,
            humidity: 65.0,
            bumble_bee_count: 3,
            honey_bee_count: 8,
            lady_bug_count: 1,
            location: 'Test Location',
            notes: 'Test message from frontend',
            timestamp: new Date().toISOString()
        };
        
        mqttService.publish('bio-d-scan/bee-data/test', JSON.stringify(testMessage));
    };

    return (
        <div className="panel mt-6">
            <div className="mb-5">
                <h5 className="text-lg font-semibold dark:text-white-light">MQTT Connection Status</h5>
            </div>
            
            {/* Connection Status */}
            <div className="mb-4">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm">
                        {isConnected ? 'Connected to HiveMQ' : 'Disconnected from HiveMQ'}
                    </span>
                </div>
            </div>

            {/* Topic Management */}
            <div className="mb-4">
                <h6 className="text-md font-medium mb-2">Subscribe to Topics</h6>
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        placeholder="Enter topic (e.g., bio-d-scan/bee-data/#)"
                        className="form-input flex-1"
                    />
                    <button
                        onClick={handleSubscribe}
                        className="btn btn-primary"
                        disabled={!isConnected}
                    >
                        Subscribe
                    </button>
                </div>
                
                {/* Subscribed Topics */}
                <div className="mb-2">
                    <h6 className="text-sm font-medium mb-1">Subscribed Topics:</h6>
                    {subscribedTopics.map((topic, index) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {topic}
                            </span>
                            <button
                                onClick={() => handleUnsubscribe(topic)}
                                className="text-xs text-red-500 hover:text-red-700"
                                disabled={!isConnected}
                            >
                                Unsubscribe
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Test Publish */}
            <div className="mb-4">
                <h6 className="text-md font-medium mb-2">Test Publishing</h6>
                <button
                    onClick={handlePublish}
                    className="btn btn-secondary"
                    disabled={!isConnected}
                >
                    Publish Test Bee Data
                </button>
            </div>

            {/* Recent Messages */}
            <div>
                <h6 className="text-md font-medium mb-2">Recent Messages</h6>
                <div className="max-h-40 overflow-y-auto border rounded p-2 bg-gray-50 dark:bg-gray-800">
                    {messages.length === 0 ? (
                        <p className="text-sm text-gray-500">No messages received yet</p>
                    ) : (
                        messages.map((message, index) => (
                            <div key={index} className="mb-2 p-2 bg-white dark:bg-gray-700 rounded text-xs">
                                <div className="font-medium text-blue-600">{message.topic}</div>
                                <div className="text-gray-600 dark:text-gray-300">
                                    {message.payload.substring(0, 100)}
                                    {message.payload.length > 100 ? '...' : ''}
                                </div>
                                <div className="text-gray-400 text-xs">
                                    {message.timestamp.toLocaleTimeString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MQTTStatus; 