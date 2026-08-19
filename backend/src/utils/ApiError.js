class ApiError extends Error{
    constructor(
        statusCode,
        message="Something went wrong",
        err=[],
        errStk="" 
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.err = err

        if(errStk){
            this.errStk = errStk
        } else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { ApiError }
