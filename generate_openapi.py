#!/usr/bin/env python3
"""
Generate OpenAPI schema without httptools dependency
"""
import json
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Import minimal dependencies to avoid httptools
from app.main import app

if __name__ == "__main__":
    # Generate the OpenAPI schema
    openapi_schema = app.openapi()
    
    # Write to file
    with open("openapi.json", "w") as f:
        json.dump(openapi_schema, f, indent=2)
    
    print("OpenAPI schema generated successfully!")
