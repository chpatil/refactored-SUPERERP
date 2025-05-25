# SuperERP Backend API Documentation

## Overview

This document provides comprehensive documentation for the SuperERP backend API, generated from the live FastAPI application. The SuperERP system is a comprehensive Enterprise Resource Planning solution designed for managing workers, attendance, teams, and various business operations.

## API Information

- **API Title**: SuperERP
- **Version**: 0.1.0
- **OpenAPI Version**: 3.1.0
- **Base URL**: `/api/v1`

## Generated Files

- `supererp-openapi.json` - Minified OpenAPI specification in JSON format
- `supererp-openapi-formatted.json` - Formatted OpenAPI specification in JSON format
- `supererp-openapi.yaml` - OpenAPI specification in YAML format

## Authentication

The API uses OAuth2 Password Bearer authentication. Most endpoints require authentication except for:
- Login endpoints
- User registration
- Health check
- QR code generation

### Authentication Flow

1. **Login**: POST `/api/v1/login/access-token`
   - Submit username/password to receive an access token
   - Token expires after 8 days (ACCESS_TOKEN_EXPIRE_MINUTES: 11520)

2. **Use Token**: Include in Authorization header
   ```
   Authorization: Bearer <access_token>
   ```

## API Endpoints Summary

### 🔐 Authentication & Login
- `POST /api/v1/login/access-token` - OAuth2 token login
- `POST /api/v1/login/test-token` - Test access token validity
- `POST /api/v1/password-recovery/{email}` - Password recovery
- `POST /api/v1/reset-password/` - Reset password
- `POST /api/v1/password-recovery-html-content/{email}` - HTML content for password recovery

### 👥 User Management
- `GET /api/v1/users/` - List users (with pagination)
- `POST /api/v1/users/` - Create new user
- `GET /api/v1/users/me` - Get current user profile
- `PATCH /api/v1/users/me` - Update current user profile
- `DELETE /api/v1/users/me` - Delete current user account
- `PATCH /api/v1/users/me/password` - Update current user password
- `POST /api/v1/users/signup` - Register new user (public)
- `GET /api/v1/users/{user_id}` - Get user by ID
- `PATCH /api/v1/users/{user_id}` - Update user
- `DELETE /api/v1/users/{user_id}` - Delete user

### 🛠️ Utilities
- `POST /api/v1/utils/test-email/` - Test email functionality
- `GET /api/v1/utils/health-check/` - Health check endpoint

### 📦 Items Management
- `GET /api/v1/items/` - List items (with pagination)
- `POST /api/v1/items/` - Create new item
- `GET /api/v1/items/{id}` - Get item by ID
- `PUT /api/v1/items/{id}` - Update item
- `DELETE /api/v1/items/{id}` - Delete item

### 👷 Workers Management
- `GET /api/v1/workers/` - List workers (with pagination)
- `POST /api/v1/workers/` - Create new worker
- `GET /api/v1/workers/{id}` - Get worker by ID
- `PUT /api/v1/workers/{id}` - Update worker
- `DELETE /api/v1/workers/{id}` - Delete worker

### 🏖️ Leave Requests
- `GET /api/v1/leave-requests/` - List leave requests (filtered by role)
- `POST /api/v1/leave-requests/` - Create new leave request
- `GET /api/v1/leave-requests/{id}` - Get leave request by ID
- `PUT /api/v1/leave-requests/{id}` - Update leave request (approve/reject)
- `DELETE /api/v1/leave-requests/{id}` - Delete leave request

### 📱 QR Code Authentication
- `POST /api/v1/qr-auth/generate` - Generate QR code for login
- `POST /api/v1/qr-auth/validate` - Validate QR code and authenticate
- `GET /api/v1/qr-auth/status/{code}` - Check QR code status

### ⏰ Attendance Management
- `GET /api/v1/attendance/` - List attendance records (with filters)
- `POST /api/v1/attendance/` - Create attendance record (check-in)
- `GET /api/v1/attendance/{id}` - Get attendance record by ID
- `PUT /api/v1/attendance/{id}` - Update attendance record
- `POST /api/v1/attendance/check-out/{id}` - Quick check-out
- `GET /api/v1/attendance/daily-summary/{date}` - Get daily attendance summary

### 👥 Team Management
- `GET /api/v1/teams/` - List team assignments
- `POST /api/v1/teams/` - Create team assignment
- `GET /api/v1/teams/my-team` - Get my team members (for supervisors)
- `PUT /api/v1/teams/{id}` - Update team assignment
- `DELETE /api/v1/teams/{id}` - Deactivate team assignment
- `GET /api/v1/teams/team-stats/{supervisor_id}` - Get team statistics

### 📊 Reports & Analytics
- `GET /api/v1/reports/attendance-summary` - Attendance summary report
- `GET /api/v1/reports/leave-summary` - Leave requests summary
- `GET /api/v1/reports/team-performance` - Team performance report
- `GET /api/v1/reports/dashboard-stats` - Dashboard statistics

### 🔒 Private Endpoints
- `POST /api/v1/private/users/` - Create user (private/internal)

## User Roles

The system supports three user roles:

1. **Admin** (`admin`)
   - Full system access
   - Can manage all users, teams, and view all reports
   - Can create, update, and delete any resource

2. **Supervisor** (`supervisor`)
   - Can manage their assigned team
   - Can approve/reject leave requests for team members
   - Can view team-specific reports and attendance
   - Limited administrative capabilities

3. **Laborer** (`laborer`)
   - Can manage their own profile and attendance
   - Can submit leave requests
   - Can view their own attendance and leave history
   - Limited to self-service operations

## Key Data Models

### User
- Authentication and profile information
- Role-based access control
- Department and supervisor assignment

### Worker
- Extended worker information
- Banking and government ID details
- Department assignment

### Attendance
- Check-in/check-out tracking
- Break duration and location
- Notes and administrative fields

### Leave Request
- Leave type and date range
- Approval workflow
- Supervisor comments

### Team Assignment
- Supervisor-laborer relationships
- Site location and team name
- Active/inactive status

### QR Code
- Time-limited authentication codes
- Mobile-friendly login system

## Error Handling

The API uses standard HTTP status codes and returns structured error responses:

- `200` - Success
- `422` - Validation Error (with detailed field-level errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Pagination

List endpoints support pagination with query parameters:
- `skip` - Number of records to skip (default: 0)
- `limit` - Maximum number of records to return (default: 100)

## Filtering

Many endpoints support filtering:
- Attendance: by employee_id, start_date, end_date
- Teams: by supervisor_id, is_active
- Reports: by date ranges, location, team, etc.

## Generated On

This documentation was generated on $(date) from the live SuperERP FastAPI application.

## Usage

To use this OpenAPI specification:

1. **Import into API clients**: Use tools like Postman, Insomnia, or curl
2. **Generate SDKs**: Use OpenAPI generators for various programming languages
3. **API Documentation**: Host with Swagger UI, Redoc, or similar tools
4. **Testing**: Use the specification for automated API testing

## Files Location

- OpenAPI JSON: `supererp-openapi.json`
- Formatted JSON: `supererp-openapi-formatted.json`
- YAML Format: `supererp-openapi.yaml`
- Documentation: `API_DOCUMENTATION.md` (this file)

## Interactive Documentation

When the SuperERP backend is running, you can access:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/api/v1/openapi.json`
