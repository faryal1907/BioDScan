# API Changes - Proxy Implementation with Sample Data

## Overview
The Bio-D-Scan application has been updated to use proxy endpoints with believable sample data instead of external API calls. This allows for development and testing without requiring external dependencies.

## Changes Made

# Proxy Endpoint
http://localhost:8000/api/external-bee-data

### Backend Changes (`backend/app/api.py`)

1. **Removed External API Dependency**: 
   - Removed `httpx` import and external API calls
   - Added sample data generation functionality

2. **Sample Data Generator**:
   - Generates 30 days of realistic bee monitoring data
   - Includes 5 different hives with unique locations
   - Temperature follows daily cycles (warmer during day, cooler at night)
   - Humidity inversely related to temperature
   - Bee counts vary based on temperature and time of day
   - Bees are more active during warmer hours (8-18) and optimal temperatures (15-25°C)

3. **Updated Proxy Endpoint** (`/api/external-bee-data`):
   - Now returns generated sample data instead of fetching from external API
   - Returns 720 data points (30 days × 24 hours)
   - Includes comprehensive bee count data

### Model Updates (`backend/app/models.py`)

1. **Extended Bee Data Model**:
   - Added `bumble_bee_count`, `honey_bee_count`, `lady_bug_count` fields
   - All fields are optional with default values of 0

### Frontend Changes (`bio-d-scan/app/api/data/route.js`)

1. **Added GET Endpoint**:
   - Fetches data from backend proxy endpoint (`http://localhost:8000/api/external-bee-data`)
   - Transforms data to match frontend model structure
   - Calculates total counts from individual bee counts

2. **Data Transformation**:
   - Converts backend timestamp to Date and Time fields
   - Maps bee count fields to frontend model format
   - Maintains temperature and humidity data

## Sample Data Characteristics

### Temperature Data
- Base temperature: 20°C
- Daily variation: ±8°C (warmer during day, cooler at night)
- Random variation: ±2°C
- Realistic range: 10-30°C

### Humidity Data
- Base humidity: 70%
- Inverse relationship with temperature
- Random variation: ±5%
- Realistic range: 30-90%

### Bee Count Data
- **Bumble Bees**: 0-5 per reading (base: 3)
- **Honey Bees**: 0-12 per reading (base: 8)
- **Lady Bugs**: 0-3 per reading (base: 2)
- Activity varies by:
  - Time of day (higher during 8-18 hours)
  - Temperature (optimal around 25°C)
  - Random variation

### Hive Information
- **Hive IDs**: HIVE-001, HIVE-002, HIVE-003, HIVE-004, HIVE-005
- **Locations**: North Field, South Garden, East Meadow, West Orchard, Central Park

## Testing

A test script (`test_api.py`) has been created to verify the API functionality:

```bash
python test_api.py
```

This script will:
- Test the proxy endpoint
- Display sample data records
- Test the stats endpoint
- Verify data structure and content

## Usage

### Backend
```bash
cd backend
uvicorn app.api:router --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd bio-d-scan
npm run dev
```

### API Endpoints

1. **GET `/api/external-bee-data`** - Returns sample bee monitoring data
2. **GET `/api/bee-data`** - Returns stored bee data (if any)
3. **POST `/api/bee-data`** - Adds new bee data to database
4. **GET `/api/stats`** - Returns statistics about stored data

## Benefits

1. **Development Independence**: No external API dependencies required
2. **Realistic Data**: Sample data follows realistic patterns and relationships
3. **Comprehensive Coverage**: Includes all required fields for frontend display
4. **Easy Testing**: Consistent data for testing and development
5. **Scalable**: Can easily modify sample data generation parameters

## Future Enhancements

1. Add seasonal variations to bee activity
2. Include weather event impacts on bee behavior
3. Add more hive locations and types
4. Implement data export functionality
5. Add data visualization endpoints 