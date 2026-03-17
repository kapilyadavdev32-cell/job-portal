class ApiError extends Error {
  constructor(statusCode, message = "something wrong", errors = [], stack = "") {
    super(message); // call parent class
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor); // generate stack trace automatically
    }
  }
}

export { ApiError };
