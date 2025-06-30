from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class BeeDataCreate(BaseModel):
    hive_id: str = Field(..., description="Unique identifier for the hive")
    temperature: float = Field(..., ge=-50, le=100, description="Temperature in Celsius")
    humidity: float = Field(..., ge=0, le=100, description="Humidity percentage")
    bumble_bee_count: Optional[int] = Field(default=0, ge=0, description="Number of bumble bees observed")
    honey_bee_count: Optional[int] = Field(default=0, ge=0, description="Number of honey bees observed")
    lady_bug_count: Optional[int] = Field(default=0, ge=0, description="Number of lady bugs observed")
    location: Optional[str] = Field(default=None, description="Hive location")
    notes: Optional[str] = Field(default=None, description="Additional notes")

class BeeDataResponse(BeeDataCreate):
    id: str
    timestamp: datetime
    
    class Config:
        from_attributes = True