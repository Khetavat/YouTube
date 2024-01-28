class ApiError extends Error{
    constructor(statusCode,msg = "Something went wrong"){
        super();
        this.statusCode = statusCode;
        this.message = msg;
    }
}

export {ApiError};