const mongoOperators = [
  'eq',
  'gt',
  'gte',
  'lt',
  'lte',
  'ne',
  'in',
  'nin',
  'all',
  'only',
  'exists',
  'search',
];

const generateFilters = (filters) => {
  let results = [];
  for (let filter of filters) {
    // if (!results.length || results.filter(item => item !== filter).length) {
    //   results.push(filter);
    // }
    for (let query of mongoOperators) {
      results.push(`${filter}_${query}`);
    }
  }
  return results;
};

const changeTimestampKeys = (timestampQuery) => {
  let result;
  const timestampRegex = RegExp(/(?:|\W\S)(created)|(updated)(?:$|\W\S)/);
  const splitedQuery = timestampQuery.split('_');
  if (timestampRegex.test(timestampQuery)) {
    if (splitedQuery.length > 1) {
      for (const query of splitedQuery) {
        if (timestampRegex.test(query)) {
          result = result ? result + `${query}At` : `${query}At`;
        }
      }
    } else {
      result = `${timestampQuery}At`;
    }
  } else {
    result = timestampQuery;
  }
  return result;
};

const FilterHandler = (filter) => {
  const MongoQueriesRegex = RegExp(
    /(?:|\W)(_eq)|(_gt)|(_gte)|(_lt)|(_lte)|(_ne)|(_in)|(_nin)|(_all)|(_only)|(_exists)|(_regex)(?:$|\W)/,
  );
  const numberRegex = RegExp(/^[-+]?[0-9]*\.?[0-9]+/);
  const bracketsRegex = RegExp(/\[?\[|\[?\]|\[?,/);
  for (let [filterKey, filterValue] of Object.entries(filter)) {
    let filterNewKey;
    let filterNewValue;
    const isMongoQuery = MongoQueriesRegex.test(filterKey);
    const isNotTimestamp = !filterValue.includes('-') || isNaN(Date.parse(filterValue));
    if (bracketsRegex.test(filterValue)) {
      let valueArray = [];
      for (let value of filterValue.split(bracketsRegex)) {
        if (value.length && !bracketsRegex.test(value)) {
          if (numberRegex.test(value) && isNotTimestamp) {
            valueArray.push(value);
          } else if (!isNotTimestamp) {
            valueArray.push(new Date(value).toISOString());
          } else {
            valueArray.push(RegExp('^' + value + '$', 'i'));
          }
        }
      }
      filterNewValue = valueArray;
    } else {
      if (!isNotTimestamp) {
        filterNewValue = new Date(filterValue).toISOString();
      } else if (numberRegex.test(filterValue) || isNotTimestamp) {
        filterNewValue = filterValue;
      } else {
        filterNewValue = RegExp('^' + filterValue + '$', 'i');
      }
    }
    if (isMongoQuery) {
      const keyArray = filterKey.split('_');
      const mongoQueryOperator = keyArray[keyArray.length - 1];
      if (MongoQueriesRegex.test('_' + mongoQueryOperator)) {
        const queryField = keyArray.filter((str) => str !== mongoQueryOperator).join('_');
        filterNewKey = changeTimestampKeys(queryField.split('_').join('.'));
        filter[filterNewKey] = { ['$' + mongoQueryOperator]: filterNewValue };
        delete filter[filterKey];
      }
    } else {
      const keyArray = filterKey.split('_');
      if (keyArray.length > 1) {
        filterNewKey = changeTimestampKeys(filterKey.split('_').join('.'));
        filter[filterNewKey] = filterNewValue;
      } else {
        filterNewKey = changeTimestampKeys(filterKey);
        filter[filterNewKey] = filterNewValue;
      }
    }
  }
  return filter;
};

module.exports = {
  generalFilters,
  generateFilters,
  FilterHandler,
};
