const statusMessages = require('../config/statusMessages');

/**
 * Create an object composed of the picked object properties
 * @param {string} code
 * @param {string} statusCode
 * @param {string} message
 * @param {Object} data
 * @returns {Object}
 */
const ApiResponse = (code, statusCode, message, data) => {
	let modifiedData = { code, statusCode, message }
	for (const [serviceName] of Object.entries(statusMessages)) {
		for (const [textIdKey, textId] of Object.entries(statusMessages[serviceName])) {
			if (textIdKey === statusCode) {
				modifiedData = {
					...modifiedData,
					textId
				};
			};
		};
	};
	return { ...modifiedData, data };
};

module.exports = ApiResponse;
