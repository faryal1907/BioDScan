#!/usr/bin/env python3
"""
Test script to verify the backend API is working with sample data
"""

import asyncio
import httpx
import json

async def test_api():
    """Test the backend API endpoints"""
    base_url = "http://localhost:8000"
    
    async with httpx.AsyncClient() as client:
        try:
            # Test the proxy endpoint
            print("Testing proxy endpoint...")
            response = await client.get(f"{base_url}/api/external-bee-data")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Proxy endpoint working!")
                print(f"Status: {data.get('status')}")
                print(f"Message: {data.get('message')}")
                print(f"Data count: {data.get('count')}")
                
                # Show first few records
                if data.get('data'):
                    print("\nFirst 3 records:")
                    for i, record in enumerate(data['data'][:3]):
                        print(f"Record {i+1}:")
                        print(f"  Hive ID: {record['hive_id']}")
                        print(f"  Temperature: {record['temperature']}°C")
                        print(f"  Humidity: {record['humidity']}%")
                        print(f"  Bumble Bees: {record['bumble_bee_count']}")
                        print(f"  Honey Bees: {record['honey_bee_count']}")
                        print(f"  Lady Bugs: {record['lady_bug_count']}")
                        print(f"  Location: {record['location']}")
                        print(f"  Timestamp: {record['timestamp']}")
                        print()
            else:
                print(f"❌ Proxy endpoint failed with status {response.status_code}")
                print(f"Response: {response.text}")
                
        except Exception as e:
            print(f"❌ Error testing API: {e}")
            
        try:
            # Test the stats endpoint
            print("\nTesting stats endpoint...")
            response = await client.get(f"{base_url}/api/stats")
            
            if response.status_code == 200:
                stats = response.json()
                print(f"✅ Stats endpoint working!")
                print(f"Total records: {stats.get('total_records')}")
                print(f"Averages: {stats.get('averages')}")
            else:
                print(f"❌ Stats endpoint failed with status {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error testing stats: {e}")

if __name__ == "__main__":
    print("Testing Bio-D-Scan Backend API...")
    print("=" * 40)
    asyncio.run(test_api()) 