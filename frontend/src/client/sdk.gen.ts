// This file is auto-generated by @hey-api/openapi-ts

import type { CancelablePromise } from './core/CancelablePromise';
import { OpenAPI } from './core/OpenAPI';
import { request as __request } from './core/request';
import type { AttendanceReadAttendanceRecordsData, AttendanceReadAttendanceRecordsResponse, AttendanceCreateAttendanceRecordData, AttendanceCreateAttendanceRecordResponse, AttendanceReadAttendanceRecordData, AttendanceReadAttendanceRecordResponse, AttendanceUpdateAttendanceRecordData, AttendanceUpdateAttendanceRecordResponse, AttendanceCheckOutData, AttendanceCheckOutResponse, AttendanceGetDailyAttendanceSummaryData, AttendanceGetDailyAttendanceSummaryResponse, ItemsReadItemsData, ItemsReadItemsResponse, ItemsCreateItemData, ItemsCreateItemResponse, ItemsReadItemData, ItemsReadItemResponse, ItemsUpdateItemData, ItemsUpdateItemResponse, ItemsDeleteItemData, ItemsDeleteItemResponse, LeaveRequestsReadLeaveRequestsData, LeaveRequestsReadLeaveRequestsResponse, LeaveRequestsCreateLeaveRequestData, LeaveRequestsCreateLeaveRequestResponse, LeaveRequestsReadLeaveRequestData, LeaveRequestsReadLeaveRequestResponse, LeaveRequestsUpdateLeaveRequestData, LeaveRequestsUpdateLeaveRequestResponse, LeaveRequestsDeleteLeaveRequestData, LeaveRequestsDeleteLeaveRequestResponse, LoginLoginAccessTokenData, LoginLoginAccessTokenResponse, LoginTestTokenResponse, LoginRecoverPasswordData, LoginRecoverPasswordResponse, LoginResetPasswordData, LoginResetPasswordResponse, LoginRecoverPasswordHtmlContentData, LoginRecoverPasswordHtmlContentResponse, PrivateCreateUserData, PrivateCreateUserResponse, QrAuthenticationGenerateQrCodeResponse, QrAuthenticationValidateQrCodeData, QrAuthenticationValidateQrCodeResponse, QrAuthenticationCheckQrStatusData, QrAuthenticationCheckQrStatusResponse, ReportsGetAttendanceSummaryData, ReportsGetAttendanceSummaryResponse, ReportsGetLeaveSummaryData, ReportsGetLeaveSummaryResponse, ReportsGetTeamPerformanceReportData, ReportsGetTeamPerformanceReportResponse, ReportsGetDashboardStatisticsResponse, TeamsReadTeamAssignmentsData, TeamsReadTeamAssignmentsResponse, TeamsCreateTeamAssignmentData, TeamsCreateTeamAssignmentResponse, TeamsGetMyTeamResponse, TeamsUpdateTeamAssignmentData, TeamsUpdateTeamAssignmentResponse, TeamsDeactivateTeamAssignmentData, TeamsDeactivateTeamAssignmentResponse, TeamsGetTeamStatisticsData, TeamsGetTeamStatisticsResponse, UsersReadUsersData, UsersReadUsersResponse, UsersCreateUserData, UsersCreateUserResponse, UsersReadUserMeResponse, UsersDeleteUserMeResponse, UsersUpdateUserMeData, UsersUpdateUserMeResponse, UsersUpdatePasswordMeData, UsersUpdatePasswordMeResponse, UsersRegisterUserData, UsersRegisterUserResponse, UsersReadUserByIdData, UsersReadUserByIdResponse, UsersUpdateUserData, UsersUpdateUserResponse, UsersDeleteUserData, UsersDeleteUserResponse, UtilsTestEmailData, UtilsTestEmailResponse, UtilsHealthCheckResponse, WorkersReadWorkersData, WorkersReadWorkersResponse, WorkersCreateWorkerData, WorkersCreateWorkerResponse, WorkersReadWorkerData, WorkersReadWorkerResponse, WorkersUpdateWorkerData, WorkersUpdateWorkerResponse, WorkersDeleteWorkerData, WorkersDeleteWorkerResponse } from './types.gen';

export class AttendanceService {
    /**
     * Read Attendance Records
     * Retrieve attendance records.
     * @param data The data for the request.
     * @param data.skip
     * @param data.limit
     * @param data.employeeId
     * @param data.startDate
     * @param data.endDate
     * @returns AttendancesPublic Successful Response
     * @throws ApiError
     */
    public static readAttendanceRecords(data: AttendanceReadAttendanceRecordsData = {}): CancelablePromise<AttendanceReadAttendanceRecordsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/attendance/',
            query: {
                skip: data.skip,
                limit: data.limit,
                employee_id: data.employeeId,
                start_date: data.startDate,
                end_date: data.endDate
            },
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Create Attendance Record
     * Create new attendance record (check-in).
     * @param data The data for the request.
     * @param data.requestBody
     * @returns AttendancePublic Successful Response
     * @throws ApiError
     */
    public static createAttendanceRecord(data: AttendanceCreateAttendanceRecordData): CancelablePromise<AttendanceCreateAttendanceRecordResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/attendance/',
            body: data.requestBody,
            mediaType: 'application/json',
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Read Attendance Record
     * Get attendance record by ID.
     * @param data The data for the request.
     * @param data.id
     * @returns AttendancePublic Successful Response
     * @throws ApiError
     */
    public static readAttendanceRecord(data: AttendanceReadAttendanceRecordData): CancelablePromise<AttendanceReadAttendanceRecordResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/attendance/{id}',
            path: {
                id: data.id
            },
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Update Attendance Record
     * Update attendance record (check-out, add notes, etc.).
     * @param data The data for the request.
     * @param data.id
     * @param data.requestBody
     * @returns AttendancePublic Successful Response
     * @throws ApiError
     */
    public static updateAttendanceRecord(data: AttendanceUpdateAttendanceRecordData): CancelablePromise<AttendanceUpdateAttendanceRecordResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/attendance/{id}',
            path: {
                id: data.id
            },
            body: data.requestBody,
            mediaType: 'application/json',
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Check Out
     * Quick check-out for an attendance record.
     * @param data The data for the request.
     * @param data.id
     * @returns AttendancePublic Successful Response
     * @throws ApiError
     */
    public static checkOut(data: AttendanceCheckOutData): CancelablePromise<AttendanceCheckOutResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/attendance/check-out/{id}',
            path: {
                id: data.id
            },
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Get Daily Attendance Summary
     * Get daily attendance summary for reporting.
     * Supervisors see their team, admins see all.
     * @param data The data for the request.
     * @param data.date
     * @param data.siteLocation
     * @returns unknown Successful Response
     * @throws ApiError
     */
    public static getDailyAttendanceSummary(data: AttendanceGetDailyAttendanceSummaryData): CancelablePromise<AttendanceGetDailyAttendanceSummaryResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/attendance/daily-summary/{date}',
            path: {
                date: data.date
            },
            query: {
                site_location: data.siteLocation
            },
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
}

export class ItemsService {
    /**
     * Read Items
     * Retrieve items.
     * @param data The data for the request.
     * @param data.skip
     * @param data.limit
     * @returns ItemsPublic Successful Response
     * @throws ApiError
     */
    public static readItems(data: ItemsReadItemsData = {}): CancelablePromise<ItemsReadItemsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/items/',
            query: {
                skip: data.skip,
                limit: data.limit
            },
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Create Item
     * Create new item.
     * @param data The data for the request.
     * @param data.requestBody
     * @returns ItemPublic Successful Response
     * @throws ApiError
     */
    public static createItem(data: ItemsCreateItemData): CancelablePromise<ItemsCreateItemResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/items/',
            body: data.requestBody,
            mediaType: 'application/json',
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Read Item
     * Get item by ID.
     * @param data The data for the request.
     * @param data.id
     * @returns ItemPublic Successful Response
     * @throws ApiError
     */
    public static readItem(data: ItemsReadItemData): CancelablePromise<ItemsReadItemResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/items/{id}',
            path: {
                id: data.id
            },
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Update Item
     * Update an item.
     * @param data The data for the request.
     * @param data.id
     * @param data.requestBody
     * @returns ItemPublic Successful Response
     * @throws ApiError
     */
    public static updateItem(data: ItemsUpdateItemData): CancelablePromise<ItemsUpdateItemResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/items/{id}',
            path: {
                id: data.id
            },
            body: data.requestBody,
            mediaType: 'application/json',
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Delete Item
     * Delete an item.
     * @param data The data for the request.
     * @param data.id
     * @returns Message Successful Response
     * @throws ApiError
     */
    public static deleteItem(data: ItemsDeleteItemData): CancelablePromise<ItemsDeleteItemResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/items/{id}',
            path: {
                id: data.id
            },
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
}

export class LeaveRequestsService {
    /**
     * Read Leave Requests
     * Retrieve leave requests.
     * - Admin: can see all requests
     * - Supervisor: can see their team's requests
     * - Laborer: can see only their own requests
     * @param data The data for the request.
     * @param data.skip
     * @param data.limit
     * @returns LeaveRequestsPublic Successful Response
     * @throws ApiError
     */
    public static readLeaveRequests(data: LeaveRequestsReadLeaveRequestsData = {}): CancelablePromise<LeaveRequestsReadLeaveRequestsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/leave-requests/',
            query: {
                skip: data.skip,
                limit: data.limit
            },
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Create Leave Request
     * Create new leave request.
     * Only laborers can create leave requests for themselves.
     * @param data The data for the request.
     * @param data.requestBody
     * @returns LeaveRequestPublic Successful Response
     * @throws ApiError
     */
    public static createLeaveRequest(data: LeaveRequestsCreateLeaveRequestData): CancelablePromise<LeaveRequestsCreateLeaveRequestResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/leave-requests/',
            body: data.requestBody,
            mediaType: 'application/json',
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Read Leave Request
     * Get leave request by ID.
     * @param data The data for the request.
     * @param data.id
     * @returns LeaveRequestPublic Successful Response
     * @throws ApiError
     */
    public static readLeaveRequest(data: LeaveRequestsReadLeaveRequestData): CancelablePromise<LeaveRequestsReadLeaveRequestResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/leave-requests/{id}',
            path: {
                id: data.id
            },
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Update Leave Request
     * Update leave request (approve/reject).
     * Only supervisors and admins can update leave requests.
     * @param data The data for the request.
     * @param data.id
     * @param data.requestBody
     * @returns LeaveRequestPublic Successful Response
     * @throws ApiError
     */
    public static updateLeaveRequest(data: LeaveRequestsUpdateLeaveRequestData): CancelablePromise<LeaveRequestsUpdateLeaveRequestResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/leave-requests/{id}',
            path: {
                id: data.id
            },
            body: data.requestBody,
            mediaType: 'application/json',
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Delete Leave Request
     * Delete a leave request.
     * Only the employee who created it or admin can delete.
     * @param data The data for the request.
     * @param data.id
     * @returns Message Successful Response
     * @throws ApiError
     */
    public static deleteLeaveRequest(data: LeaveRequestsDeleteLeaveRequestData): CancelablePromise<LeaveRequestsDeleteLeaveRequestResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/leave-requests/{id}',
            path: {
                id: data.id
            },
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
}

export class LoginService {
    /**
     * Login Access Token
     * OAuth2 compatible token login, get an access token for future requests
     * @param data The data for the request.
     * @param data.formData
     * @returns Token Successful Response
     * @throws ApiError
     */
    public static loginAccessToken(data: LoginLoginAccessTokenData): CancelablePromise<LoginLoginAccessTokenResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/login/access-token',
            formData: data.formData,
            mediaType: 'application/x-www-form-urlencoded',
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Test Token
     * Test access token
     * @returns UserPublic Successful Response
     * @throws ApiError
     */
    public static testToken(): CancelablePromise<LoginTestTokenResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/login/test-token'
        });
    }
    
    /**
     * Recover Password
     * Password Recovery
     * @param data The data for the request.
     * @param data.email
     * @returns Message Successful Response
     * @throws ApiError
     */
    public static recoverPassword(data: LoginRecoverPasswordData): CancelablePromise<LoginRecoverPasswordResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/password-recovery/{email}',
            path: {
                email: data.email
            },
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Reset Password
     * Reset password
     * @param data The data for the request.
     * @param data.requestBody
     * @returns Message Successful Response
     * @throws ApiError
     */
    public static resetPassword(data: LoginResetPasswordData): CancelablePromise<LoginResetPasswordResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/reset-password/',
            body: data.requestBody,
            mediaType: 'application/json',
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Recover Password Html Content
     * HTML Content for Password Recovery
     * @param data The data for the request.
     * @param data.email
     * @returns string Successful Response
     * @throws ApiError
     */
    public static recoverPasswordHtmlContent(data: LoginRecoverPasswordHtmlContentData): CancelablePromise<LoginRecoverPasswordHtmlContentResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/password-recovery-html-content/{email}',
            path: {
                email: data.email
            },
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
}

export class PrivateService {
    /**
     * Create User
     * Create a new user.
     * @param data The data for the request.
     * @param data.requestBody
     * @returns UserPublic Successful Response
     * @throws ApiError
     */
    public static createUser(data: PrivateCreateUserData): CancelablePromise<PrivateCreateUserResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/private/users/',
            body: data.requestBody,
            mediaType: 'application/json',
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
}

export class QrAuthenticationService {
    /**
     * Generate Qr Code
     * Generate a new QR code for login.
     * QR codes expire after 5 minutes.
     * @returns QRCodePublic Successful Response
     * @throws ApiError
     */
    public static generateQrCode(): CancelablePromise<QrAuthenticationGenerateQrCodeResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/qr-auth/generate'
        });
    }
    
    /**
     * Validate Qr Code
     * Validate QR code and authenticate user.
     * @param data The data for the request.
     * @param data.qrCode
     * @param data.employeeId
     * @returns Token Successful Response
     * @throws ApiError
     */
    public static validateQrCode(data: QrAuthenticationValidateQrCodeData): CancelablePromise<QrAuthenticationValidateQrCodeResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/qr-auth/validate',
            query: {
                qr_code: data.qrCode,
                employee_id: data.employeeId
            },
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Check Qr Status
     * Check if QR code is still valid and unused.
     * @param data The data for the request.
     * @param data.code
     * @returns unknown Successful Response
     * @throws ApiError
     */
    public static checkQrStatus(data: QrAuthenticationCheckQrStatusData): CancelablePromise<QrAuthenticationCheckQrStatusResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/qr-auth/status/{code}',
            path: {
                code: data.code
            },
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
}

export class ReportsService {
    /**
     * Get Attendance Summary
     * Get attendance summary report for a date range.
     * @param data The data for the request.
     * @param data.startDate
     * @param data.endDate
     * @param data.siteLocation
     * @param data.teamName
     * @param data.supervisorId
     * @returns unknown Successful Response
     * @throws ApiError
     */
    public static getAttendanceSummary(data: ReportsGetAttendanceSummaryData): CancelablePromise<ReportsGetAttendanceSummaryResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/reports/attendance-summary',
            query: {
                start_date: data.startDate,
                end_date: data.endDate,
                site_location: data.siteLocation,
                team_name: data.teamName,
                supervisor_id: data.supervisorId
            },
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Get Leave Summary
     * Get leave requests summary for a date range.
     * @param data The data for the request.
     * @param data.startDate
     * @param data.endDate
     * @param data.status
     * @param data.supervisorId
     * @returns unknown Successful Response
     * @throws ApiError
     */
    public static getLeaveSummary(data: ReportsGetLeaveSummaryData): CancelablePromise<ReportsGetLeaveSummaryResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/reports/leave-summary',
            query: {
                start_date: data.startDate,
                end_date: data.endDate,
                status: data.status,
                supervisor_id: data.supervisorId
            },
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Get Team Performance Report
     * Get team performance report.
     * @param data The data for the request.
     * @param data.startDate
     * @param data.endDate
     * @returns unknown Successful Response
     * @throws ApiError
     */
    public static getTeamPerformanceReport(data: ReportsGetTeamPerformanceReportData): CancelablePromise<ReportsGetTeamPerformanceReportResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/reports/team-performance',
            query: {
                start_date: data.startDate,
                end_date: data.endDate
            },
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Get Dashboard Statistics
     * Get dashboard statistics for the current user.
     * @returns unknown Successful Response
     * @throws ApiError
     */
    public static getDashboardStatistics(): CancelablePromise<ReportsGetDashboardStatisticsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/reports/dashboard-stats'
        });
    }
    
}

export class TeamsService {
    /**
     * Read Team Assignments
     * Retrieve team assignments.
     * @param data The data for the request.
     * @param data.skip
     * @param data.limit
     * @param data.supervisorId
     * @param data.isActive
     * @returns TeamAssignmentPublic Successful Response
     * @throws ApiError
     */
    public static readTeamAssignments(data: TeamsReadTeamAssignmentsData = {}): CancelablePromise<TeamsReadTeamAssignmentsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/teams/',
            query: {
                skip: data.skip,
                limit: data.limit,
                supervisor_id: data.supervisorId,
                is_active: data.isActive
            },
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Create Team Assignment
     * Create new team assignment.
     * Only admins can create team assignments.
     * @param data The data for the request.
     * @param data.laborerId
     * @param data.requestBody
     * @returns TeamAssignmentPublic Successful Response
     * @throws ApiError
     */
    public static createTeamAssignment(data: TeamsCreateTeamAssignmentData): CancelablePromise<TeamsCreateTeamAssignmentResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/teams/',
            query: {
                laborer_id: data.laborerId
            },
            body: data.requestBody,
            mediaType: 'application/json',
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Get My Team
     * Get team members for a supervisor.
     * @returns unknown Successful Response
     * @throws ApiError
     */
    public static getMyTeam(): CancelablePromise<TeamsGetMyTeamResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/teams/my-team'
        });
    }
    
    /**
     * Update Team Assignment
     * Update team assignment.
     * Only admins and the assigned supervisor can update.
     * @param data The data for the request.
     * @param data.id
     * @param data.requestBody
     * @returns TeamAssignmentPublic Successful Response
     * @throws ApiError
     */
    public static updateTeamAssignment(data: TeamsUpdateTeamAssignmentData): CancelablePromise<TeamsUpdateTeamAssignmentResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/teams/{id}',
            path: {
                id: data.id
            },
            body: data.requestBody,
            mediaType: 'application/json',
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Deactivate Team Assignment
     * Deactivate a team assignment.
     * Only admins can deactivate assignments.
     * @param data The data for the request.
     * @param data.id
     * @returns Message Successful Response
     * @throws ApiError
     */
    public static deactivateTeamAssignment(data: TeamsDeactivateTeamAssignmentData): CancelablePromise<TeamsDeactivateTeamAssignmentResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/teams/{id}',
            path: {
                id: data.id
            },
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Get Team Statistics
     * Get team statistics for a supervisor.
     * @param data The data for the request.
     * @param data.supervisorId
     * @returns unknown Successful Response
     * @throws ApiError
     */
    public static getTeamStatistics(data: TeamsGetTeamStatisticsData): CancelablePromise<TeamsGetTeamStatisticsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/teams/team-stats/{supervisor_id}',
            path: {
                supervisor_id: data.supervisorId
            },
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
}

export class UsersService {
    /**
     * Read Users
     * Retrieve users.
     * @param data The data for the request.
     * @param data.skip
     * @param data.limit
     * @returns UsersPublic Successful Response
     * @throws ApiError
     */
    public static readUsers(data: UsersReadUsersData = {}): CancelablePromise<UsersReadUsersResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/users/',
            query: {
                skip: data.skip,
                limit: data.limit
            },
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Create User
     * Create new user.
     * @param data The data for the request.
     * @param data.requestBody
     * @returns UserPublic Successful Response
     * @throws ApiError
     */
    public static createUser(data: UsersCreateUserData): CancelablePromise<UsersCreateUserResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/users/',
            body: data.requestBody,
            mediaType: 'application/json',
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Read User Me
     * Get current user.
     * @returns UserPublic Successful Response
     * @throws ApiError
     */
    public static readUserMe(): CancelablePromise<UsersReadUserMeResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/users/me'
        });
    }
    
    /**
     * Delete User Me
     * Delete own user.
     * @returns Message Successful Response
     * @throws ApiError
     */
    public static deleteUserMe(): CancelablePromise<UsersDeleteUserMeResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/users/me'
        });
    }
    
    /**
     * Update User Me
     * Update own user.
     * @param data The data for the request.
     * @param data.requestBody
     * @returns UserPublic Successful Response
     * @throws ApiError
     */
    public static updateUserMe(data: UsersUpdateUserMeData): CancelablePromise<UsersUpdateUserMeResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/users/me',
            body: data.requestBody,
            mediaType: 'application/json',
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Update Password Me
     * Update own password.
     * @param data The data for the request.
     * @param data.requestBody
     * @returns Message Successful Response
     * @throws ApiError
     */
    public static updatePasswordMe(data: UsersUpdatePasswordMeData): CancelablePromise<UsersUpdatePasswordMeResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/users/me/password',
            body: data.requestBody,
            mediaType: 'application/json',
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Register User
     * Create new user without the need to be logged in.
     * @param data The data for the request.
     * @param data.requestBody
     * @returns UserPublic Successful Response
     * @throws ApiError
     */
    public static registerUser(data: UsersRegisterUserData): CancelablePromise<UsersRegisterUserResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/users/signup',
            body: data.requestBody,
            mediaType: 'application/json',
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Read User By Id
     * Get a specific user by id.
     * @param data The data for the request.
     * @param data.userId
     * @returns UserPublic Successful Response
     * @throws ApiError
     */
    public static readUserById(data: UsersReadUserByIdData): CancelablePromise<UsersReadUserByIdResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/users/{user_id}',
            path: {
                user_id: data.userId
            },
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Update User
     * Update a user.
     * @param data The data for the request.
     * @param data.userId
     * @param data.requestBody
     * @returns UserPublic Successful Response
     * @throws ApiError
     */
    public static updateUser(data: UsersUpdateUserData): CancelablePromise<UsersUpdateUserResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/users/{user_id}',
            path: {
                user_id: data.userId
            },
            body: data.requestBody,
            mediaType: 'application/json',
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Delete User
     * Delete a user.
     * @param data The data for the request.
     * @param data.userId
     * @returns Message Successful Response
     * @throws ApiError
     */
    public static deleteUser(data: UsersDeleteUserData): CancelablePromise<UsersDeleteUserResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/users/{user_id}',
            path: {
                user_id: data.userId
            },
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
}

export class UtilsService {
    /**
     * Test Email
     * Test emails.
     * @param data The data for the request.
     * @param data.emailTo
     * @returns Message Successful Response
     * @throws ApiError
     */
    public static testEmail(data: UtilsTestEmailData): CancelablePromise<UtilsTestEmailResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/utils/test-email/',
            query: {
                email_to: data.emailTo
            },
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Health Check
     * @returns boolean Successful Response
     * @throws ApiError
     */
    public static healthCheck(): CancelablePromise<UtilsHealthCheckResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/utils/health-check/'
        });
    }
    
}

export class WorkersService {
    /**
     * Read Workers
     * Retrieve workers.
     * @param data The data for the request.
     * @param data.skip
     * @param data.limit
     * @returns WorkersPublic Successful Response
     * @throws ApiError
     */
    public static readWorkers(data: WorkersReadWorkersData = {}): CancelablePromise<WorkersReadWorkersResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/workers/',
            query: {
                skip: data.skip,
                limit: data.limit
            },
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Create Worker
     * Create new worker.
     * @param data The data for the request.
     * @param data.requestBody
     * @returns WorkerPublic Successful Response
     * @throws ApiError
     */
    public static createWorker(data: WorkersCreateWorkerData): CancelablePromise<WorkersCreateWorkerResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/workers/',
            body: data.requestBody,
            mediaType: 'application/json',
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Read Worker
     * Get worker by ID.
     * @param data The data for the request.
     * @param data.id
     * @returns WorkerPublic Successful Response
     * @throws ApiError
     */
    public static readWorker(data: WorkersReadWorkerData): CancelablePromise<WorkersReadWorkerResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/workers/{id}',
            path: {
                id: data.id
            },
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Update Worker
     * Update a worker.
     * @param data The data for the request.
     * @param data.id
     * @param data.requestBody
     * @returns WorkerPublic Successful Response
     * @throws ApiError
     */
    public static updateWorker(data: WorkersUpdateWorkerData): CancelablePromise<WorkersUpdateWorkerResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/workers/{id}',
            path: {
                id: data.id
            },
            body: data.requestBody,
            mediaType: 'application/json',
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
    /**
     * Delete Worker
     * Delete a worker.
     * @param data The data for the request.
     * @param data.id
     * @returns WorkerPublic Successful Response
     * @throws ApiError
     */
    public static deleteWorker(data: WorkersDeleteWorkerData): CancelablePromise<WorkersDeleteWorkerResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/workers/{id}',
            path: {
                id: data.id
            },
            errors: {
                422: 'Validation Error'
            }
        });
    }
    
}