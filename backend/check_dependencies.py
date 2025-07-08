import fastapi, uvicorn, motor, pydantic, httpx, pymongo, certifi, dotenv, paho.mqtt.client, dns

print("fastapi:", fastapi.__version__)
print("uvicorn:", uvicorn.__version__)
print("motor:", motor.version)
print("pydantic:", pydantic.VERSION)
print("httpx:", httpx.__version__)
print("pymongo:", pymongo.version)
print("certifi:", certifi.__version__)
print("python-dotenv:", dotenv.__version__)
print("paho-mqtt:", paho.mqtt.client.__version__)
print("dnspython:", dns.version.version)
