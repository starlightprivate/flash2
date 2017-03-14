// Middleware reporting response time
import util from 'util';
import trace from './../../risingStack';

// https://github.com/vodolaz095/hunt/blob/master/lib/http/expressApp.js#L854-L855

export default (req, res, next) => {
  const duration = (Date.now() - req._startTime);  // eslint-disable-line no-underscore-dangle
  trace.recordMetric(util.format('responseTime/%s/%s', req.method, req.originalUrl), duration);
  next();
};
