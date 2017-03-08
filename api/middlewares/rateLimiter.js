// Middleware for rate limiting
import RateLimiter from 'strict-rate-limiter';

import security from './security';
import redis from './../../config/redis';


// research
// https://github.com/nfriedly/express-rate-limit - do not use redis - not scallable horizontally

// looks ok, uses redis, but it do not allows us to extract IP from cloudflare header
// https://www.npmjs.com/package/express-brute

// looks ugly
// https://www.npmjs.com/package/express-limiter

// i like it
// https://www.npmjs.com/package/strict-rate-limiter

// --Anatolij

const limitRequestsInterval = 60 * 1000; // 60 seconds
const limitRequestsNumber = 100;


export default (req, res, next) => {
  const id = security.getIp(req);

// allow 100 request / 60s
  const limiter = new RateLimiter({
    id,
    limit: limitRequestsNumber,
    duration: limitRequestsInterval,
  }, redis);

  return limiter.get((err, limit, remaining, reset) => {
    if (err) {
      return next(err);
    }

    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.floor(reset / 1000));

    if (remaining >= 0) {
      // allowed, call next middleware
      return next();
    }
    // limit exceeded
    res.setHeader('Retry-After', Math.floor((reset - new Date()) / 1000));
    res.statusCode = 429; // eslint-disable-line no-param-reassign
    return res.end('Rate limit exceeded.');
  });
};
