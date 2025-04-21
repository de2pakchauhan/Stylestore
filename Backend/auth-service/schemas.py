from pydantic import BaseModel, EmailStr, Field
from datetime import date
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Used during registration where DOB is optional
class ProfileBase(BaseModel):
    date_of_birth: Optional[date] = None
    country: Optional[str] = None
    contact_number: Optional[str] = None
    pincode: Optional[str] = None
    address_line1: Optional[str] = Field(None, description="Flat, House no., Building, Company, Apartment")
    address_line2: Optional[str] = Field(None, description="Area, Street, Sector, Village")
    landmark: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None

# Schema used when updating the profile (enforcing DOB, etc.)
class ProfileUpdate(BaseModel):
    first_name: str = Field(..., description="First name is required")
    last_name: str = Field(..., description="Last name is required")
    date_of_birth: date = Field(..., description="User's date of birth is required")
    country: str = Field(..., description="Country is required")
    contact_number: str = Field(..., description="Contact number is required")
    pincode: str = Field(..., description="Pincode is required")
    address_line1: str = Field(..., description="Flat, House no., Building, Company, Apartment is required")
    address_line2: Optional[str] = Field(..., description="Area, Street, Sector, Village is required")
    landmark: Optional[str] = Field(None, description="Landmark is optional")
    city: str = Field(..., description="Town/City is required")
    state: str = Field(..., description="State is required")
    
    class Config:
        orm_mode = True

class UserResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    profile: Optional[ProfileBase] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
