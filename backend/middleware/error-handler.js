const { StatusCodes } = require("http-status-codes");

const errorHandlerMiddleware = (err, req, res, next) => {
  const error = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || "Something went wrong, try again later",
  };

  //ObjectId
  if (err.name === "CastError") {
    error.statusCode = StatusCodes.BAD_REQUEST;
    error.message = "Resource not found. Invalid: " + err.path;
  }

  //Validation Error
  if (err.name === "ValidationError") {
    error.statusCode = StatusCodes.BAD_REQUEST;
    error.message = Object.values(err.errors)
      .map((item) => item.message)
      .join(",");
  }

  //Unique email error (Duplicates)
  if (err.code && err.code === 11000) {
    error.statusCode = StatusCodes.BAD_REQUEST;
    error.message = `${Object.keys(err.keyValue)} Field has to be unique`;
  }

  //JWT Token Handler
  if (err.name === "JsonWebTokenError") {
    error.statusCode = StatusCodes.BAD_REQUEST;
    error.message = "JSON Web Token is invalid. Try again";
  }

  //JWT Token Handler Expire
  if (err.name === "TokenExpiredError") {
    error.statusCode = StatusCodes.BAD_REQUEST;
    error.message = "JSON Web Token is expired.";
  }

  res.status(error.statusCode).json({ message: error.message });
};

module.exports = errorHandlerMiddleware;
