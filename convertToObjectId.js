const { Types } = require('mongoose');

function isCouldbeObjectId(str) {
  if (typeof str === 'string') {
    return /^[a-f\d]{24}$/i.test(str);
  } else if (Array.isArray(str)) {
    return str.every((arrStr) => /^[a-f\d]{24}$/i.test(arrStr));
  }
  return false;
}

function convertArrayToObjectId(query) {
  let curr = [];
  query.map((el) => {
    if (el instanceof Array) {
    } else if (el instanceof Object) {
      const convertedQuery = convertToObjectIdOr(el);
      Object.keys(convertedQuery).map(function (key, index) {
        curr.push({ [key]: convertedQuery[key] });
      });
    }
  });
  return curr;
}

/**
 
 * @param {Object} query the query that will be converted
 * @return converted query
 */
function convertToObjectIdOr(query) {
  // if (typeof query !== 'undefined') {
  //   return query;
  // }

  if (typeof query !== 'object' || Array.isArray(query)) {
    return query;
  }

  return Object.keys(query).reduce((curr, subKey) => {
    if (isCouldbeObjectId(query[subKey])) {
      // Is an array of strings similar to ObjectId
      // or an string similar to ObjectId
      let multiMatch;
      const $or = [];

      multiMatch = {};
      multiMatch[subKey] = query[subKey];
      $or.push(multiMatch);

      multiMatch = {};
      multiMatch[subKey] = Array.isArray(query[subKey])
        ? query[subKey].map((v) => new Types.ObjectId(v))
        : new Types.ObjectId(query[subKey]);
      $or.push(multiMatch);

      if (curr.$and) {
        curr.$and.push({ $or });
      } else if (curr.$or) {
        curr.$and = [{ $or: curr.$or }, { $or }];
        delete curr.$or;
      } else {
        curr.$or = $or;
      }
    } else if (typeof query[subKey] === 'object' && !(query[subKey] instanceof Array)) {
      // Is an array of strings similar to ObjectId
      // or an string similar to ObjectId
      let multiMatch;
      const $or = [];

      Object.keys(query[subKey]).map(function (key, index) {
        if (isCouldbeObjectId(query[subKey][key])) {
          multiMatch = {};
          if (Array.isArray(query[subKey][key])) {
            multiMatch[subKey] = {
              [key]: query[subKey][key].map((v) => new Types.ObjectId(v)),
            };
          } else {
            multiMatch[subKey] = {
              [key]: new Types.ObjectId(query[subKey][key]),
            };
          }
          $or.push(multiMatch);
        }

        multiMatch = {};
        multiMatch[subKey] = query[subKey];
        $or.push(multiMatch);
      });

      if (curr.$and) {
        curr.$and.push({ $or });
      } else if (curr.$or) {
        curr.$and = [{ $or: curr.$or }, { $or }];
        delete curr.$or;
      } else {
        curr.$or = $or;
      }
    } else if (query[subKey] instanceof Array) {
      if (curr.$and) {
        curr.$and.push({ [subKey]: convertArrayToObjectId(query[subKey]) });
      } else {
        if (curr[subKey]) {
          curr.$and = [
            { [subKey]: curr[subKey] },
            { [subKey]: convertArrayToObjectId(query[subKey]) },
          ];
          delete curr[subKey];
        } else {
          curr[subKey] = convertArrayToObjectId(query[subKey]);
        }
      }
    } else {
      curr[subKey] = query[subKey];
    }
    return curr;
  }, {});
}

module.exports = convertToObjectIdOr;
