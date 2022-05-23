const statusMessages = require('../config/statusMessages');
class ApiError extends Error {
	constructor(code, statusCode, message, isOperational = true, stack = '') {
		super();
		this.code = code;
		this.statusCode = statusCode;
		this.message = message;
		this.isOperational = isOperational;
		for (const [serviceName] of Object.entries(statusMessages)) {
			for (const [textIdKey, textId] of Object.entries(statusMessages[serviceName])) {
				if (textIdKey === statusCode) {
					this.textId = textId;
				};
			};
		};
		if (stack) {
			this.stack = stack;
		} else {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}

module.exports = ApiError;
