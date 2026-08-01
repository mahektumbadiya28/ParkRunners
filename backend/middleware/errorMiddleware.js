export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // 1. Mongoose Bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    message = `Resource not found`;
    statusCode = 404;
  }

  // 2. Mongoose Duplicate Key (11000)
  if (err.code === 11000) {
    message = 'Duplicate field value entered';
    statusCode = 400;
  }

  // 3. Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    message = `Validation Error: ${messages.join(', ')}`;
    statusCode = 400;
  }

  // 4. JWT Errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Not authorized, token failed';
    statusCode = 401;
  }
  if (err.name === 'TokenExpiredError') {
    message = 'Not authorized, token expired';
    statusCode = 401;
  }

  // 5. MongoDB Timeout
  if (err.name === 'MongoTimeoutError') {
    message = 'Database connection timed out. Please try again later.';
    statusCode = 503;
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
