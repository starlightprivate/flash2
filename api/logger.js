import winston from 'winston';
import util from 'util';
import xss from 'xss';
import config from './../server-config';
import security from './middlewares/security';

import trace from './../risingStack';

// It is default logger being used for all api endpoints

export default function (level, name, req, metadata) {
  const data = metadata;
  data.ip = security.getIp(req);
  data.method = req.method;
  if (req.session) {
    data.sessionId = req.sessionID;
    data.entryPoint = req.session.entryPoint;
  }
  data.buildId = config.buildId;
  data.env = config.ENV;
  data.path = req.originalUrl;
  data.query = req.query;
  data.body = req.body;
  data.userAgent = xss(req.get('User-Agent'));
  data.env = config.ENV;
  data.type = util.format('api:%s', name);
  trace.incrementMetric('logEventsFired');
  return winston[level](name, data);
}
