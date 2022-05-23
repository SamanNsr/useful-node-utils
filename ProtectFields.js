/**
 * return an object of allowed fields
 * @param {Object} data
 * @param {Array} protectedFields
 * @returns
 */
function ProtectFields(data, protectedFields) {
  if (data instanceof Array) {
    arrayProtection(data, protectedFields);
  } else if (data instanceof Object) {
    objectProtection(data, protectedFields);
  }

  return data;
}

function objectProtection(obj, protectedFields) {
  protectedFields.map((path) => {
    const keys = path.split('.');
    const firstEl = keys.shift();
    const newKeys = [firstEl];
    if (keys.join('.') !== '') newKeys.push(keys.join('.'));

    newKeys.reduce((acc, key, index) => {
      if (acc && acc[key]) {
        if (index === newKeys.length - 1) {
          !!acc[key] ? (acc[key] = undefined) : true;
          return true;
        }
        let newProtectedFields = newKeys;
        newProtectedFields.shift();
        ProtectFields(acc[key], newProtectedFields);
        return acc[key];
      }
    }, obj);
  });
}

function arrayProtection(arr, protectedFields) {
  arr.map((value, index) => {
    if (value instanceof Object) {
      objectProtection(arr[index], protectedFields);
    }
    if (value instanceof Array) {
      arrayProtection(arr[index], protectedFields);
    }
  });
}

module.exports = ProtectFields;
