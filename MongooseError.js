const statusMessages = require('../config/statusMessages');
const httpStatus = require('http-status');

class MongooseError extends Error {
  constructor(err, isOperational = true, stack = '') {
    super();
    this.isOperational = isOperational;

    switch (err.name) {
      case 'ValidationError':
        this.code = httpStatus.BAD_REQUEST;
        this.statusCode = httpStatus['BAD_REQUEST'];
        this.message = err.message;
        break;

      default:
        this.code = httpStatus.INTERNAL_SERVER_ERROR;
        this.statusCode = httpStatus['INTERNAL_SERVER_ERROR'];
        this.message = err.message;
    }
    for (const [serviceName] of Object.entries(statusMessages)) {
      for (const [textIdKey, textId] of Object.entries(statusMessages[serviceName])) {
        if (textIdKey === this.statusCode) {
          this.textId = textId;
        }
      }
    }
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = MongooseError;
