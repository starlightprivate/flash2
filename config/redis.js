import RedisClient from 'ioredis';
import winston from 'winston';

import config from '../server-config';

const redisUrl = config.redis.REDIS_URL;
const redis = new RedisClient(redisUrl, {
  dropBufferSupport: true,
});
const { host, port } = redis.connector.options;

redis.on('connect', () => {
  winston.verbose('redis:connect', {
    host,
    port,
    type: 'redis:connect',
    env: config.ENV,
  });
});

redis.on('error', () => {
  winston.error('redis:error', {
    host,
    port,
    type: 'redis:error',
    env: config.ENV,
  });
  throw new Error('redis:error');
  // because application cannot work without redis
  // if redis database failed, application have to fail
  // because without redis it gives 500 errors to users
});

export default redis;
