const { customAlphabet } = require('nanoid');
/**
 * return generated code
 * @param {Number} size
 * @returns {String}
 */
function generateCode(size) {
  const nanoid = customAlphabet('01234567890abcdefghijklmnopqrstuvwxyz', size);
  return nanoid();
}

module.exports = generateCode;
