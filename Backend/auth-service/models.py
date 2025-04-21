from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")

class Profile(Base):
    __tablename__ = "profiles"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    date_of_birth = Column(Date)
    country = Column(String(100))
    contact_number = Column(String(20))
    pincode = Column(String(20))
    address_line1 = Column(String(200))  # Flat, House no., Building, Company, Apartment
    address_line2 = Column(String(200))  # Area, Street, Sector, Village
    landmark = Column(String(100))       # Optional
    city = Column(String(100))           # Town/City
    state = Column(String(100))          # State
    
    user = relationship("User", back_populates="profile")
