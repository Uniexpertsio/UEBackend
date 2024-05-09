const sendResponse = async (error) => {
    return new Promise((resolve, reject) => {
        let statusCode;
        let errorMessage;
        if(error.sfTrue){
            return resolve({statusCode: 200, errorMessage: "Please try later or check Internet Connectivity"})
        }
    
        switch (error.name) {
            case 'MongoError': // MongoDB duplicate key error
                if (error.code === 11000) {
                    statusCode = 409; // Conflict
                    errorMessage = 'Duplicate key error. The resource already exists.';
                }
                break;
            case 'ValidationError': // Mongoose validation error
                statusCode = 400; // Bad Request
                errorMessage = 'Validation error. Please check your request data.';
                break;
            case 'ENOENT':
                statusCode = 404; // Not Found
                errorMessage = 'Resource not found.';
                break;
            case 'EACCES':
                statusCode = 403; // Forbidden
                errorMessage = 'Access to the resource is forbidden.';
                break;
            case 'ECONNREFUSED':
                statusCode = 503; // Service Unavailable
                errorMessage = 'The service is currently unavailable. Please try again later.';
                break;
            case 'ECONNRESET':
                statusCode = 503; // Service Unavailable
                errorMessage = 'The connection was reset by the server.';
                break;
            case 'EPIPE':
                statusCode = 503; // Service Unavailable
                errorMessage = 'The remote server closed the connection.';
                break;
            case 'ETIMEDOUT':
                statusCode = 504; // Gateway Timeout
                errorMessage = 'The request timed out. Please try again later.';
                break;
            case 'EHOSTUNREACH':
                statusCode = 503; // Service Unavailable
                errorMessage = 'The host is unreachable.';
                break;
            case 'ERR_INVALID_ARG_TYPE':
                statusCode = 400;
                errorMessage = 'Invalid payload';
                break;
            default:
                statusCode = 500; // Internal Server Error
                errorMessage = 'Something went wrong on the server.';
        }
    
        resolve ({ statusCode, errorMessage });
    })
};

module.exports = { sendResponse };