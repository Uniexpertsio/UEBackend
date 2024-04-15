// const sendResponse = async (error) => {
//     const {response, status, message, data} = error;
//     var message1 = "";
//     switch (status) {
//         case "200":
//             message1 = message || "success";
//             response.json({ message: message1, code: 200, success: true, data: data });
//             break;
//         case "500":
//             message1 = message || "Some error has occured, please try again later";
//             response.json({ message: message1, code: 500, success: false });
//             break;
//         case "400":
//             message1 = message || "Invalid Parameters";
//             response.json({ message: message1, code: 400, success: false });
//             break;
//         case "404":
//             message1 = message || "Not found";
//             response.json({ message: message1, code: 404, success: false });
//             break;
//         case "422":
//             message1 = message || "Data already exist";
//             response.json({ message: message1, code: 422, success: false });
//             break;
//         case "401":
//             message1 = message || "Access denied";
//             response.json({ message: message1, code: 401, success: false });
//             break;
//     }
// }

// module.exports = { sendResponse }

// const sendResponse = async (error) => {
//     console.log('errorr->>>>>>', error.code)
//     let statusCode;
//     let errorMessage;

//     switch (error.code) {
//         case 11000: // Duplicate key error
//             statusCode = 409; // Conflict
//             errorMessage = 'Duplicate key error. The resource already exists.';
//             break;
//         default:
//             // Check if the error is a Mongoose validation error
//             if (error.name === 'ValidationError') {
//                 statusCode = 400; // Bad Request
//                 errorMessage = 'Validation error. Please check your request data.';
//             } else {
//                 // Handle other types of errors (e.g., from file system, network, etc.)
//                 switch (error.code) {
//                     case 'ENOENT':
//                         statusCode = 404; // Not Found
//                         errorMessage = 'Resource not found.';
//                         break;
//                     case 'EACCES':
//                         statusCode = 403; // Forbidden
//                         errorMessage = 'Access to the resource is forbidden.';
//                         break;
//                     case 'ECONNREFUSED':
//                         statusCode = 503; // Service Unavailable
//                         errorMessage = 'The service is currently unavailable. Please try again later.';
//                         break;
//                     case 'ECONNRESET':
//                         statusCode = 503; // Service Unavailable
//                         errorMessage = 'The connection was reset by the server.';
//                         break;
//                     case 'EPIPE':
//                         statusCode = 503; // Service Unavailable
//                         errorMessage = 'The remote server closed the connection.';
//                         break;
//                     case 'ETIMEDOUT':
//                         statusCode = 504; // Gateway Timeout
//                         errorMessage = 'The request timed out. Please try again later.';
//                         break;
//                     case 'EHOSTUNREACH':
//                         statusCode = 503; // Service Unavailable
//                         errorMessage = 'The host is unreachable.';
//                         break;
//                     case 'ERR_INVALID_ARG_TYPE':
//                         console.log('error code ---',error.code)

//                         statusCode = 400;
//                         errorMessage = 'Invalid payload';
//                         break;
//                     default:
//                         statusCode = 500; // Internal Server Error
//                         errorMessage = 'Something went wrong on the server.';
//                 }
//             }
//     }

//     return { statusCode, errorMessage };
// }

// module.exports = { sendResponse }

const sendResponse = async (error) => {
    return new Promise((resolve, reject) => {
        console.log('errorr->>>>>>', error.name);
        let statusCode;
        let errorMessage;
        if(error.sfTrue){
            return resolve({statusCode: 200, errorMessage: "Salesforce error"})
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