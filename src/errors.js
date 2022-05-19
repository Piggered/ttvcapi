import statusCodes from 'status-codes';

export function createError(statusCode, message) {
    return {
        isHttpError: true,
        statusName: statusCodes[statusCode].name,
        statusCode,
        message
    }
}