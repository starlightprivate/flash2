import trace from './../../risingStack';

export default (req, res, next) => {
  trace.incrementMetric('resSuccess');
  res.success = (obj) => { // eslint-disable-line no-param-reassign
    if (obj && typeof obj.toJSON === 'function') {
      obj = obj.toJSON(); // eslint-disable-line no-param-reassign
    }
    return res.json(Object.assign({
      success: true,
    }, obj));
  };
  next();
};

