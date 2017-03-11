import winston from 'winston';
import security from './middlewares/security';
import trace from '@risingstack/trace';

// It is default logger being used for all api endpoints

export default function (level, name, req, metadata) {
  const data = metadata;
  data.sessionId = req.sessionID;
  data.ip = security.getIp(req);
  data.method = req.method;
  data.entryPoint = req.session.entryPoint;
  data.path = req.originalUrl;
  data.query = req.query;
  data.body = req.body;
  data.userAgent = req.get('User-Agent');
  trace.incrementMetric('logEventsFired');
  return winston[level](name, data);
}
