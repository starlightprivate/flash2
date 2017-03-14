import winston from 'winston';
import util from 'util';
import config from './../server-config';
import security from './middlewares/security';

// It is default logger being used for all api endpoints

export default function (level, name, req, metadata) {
  const data = metadata;
  data.ip = security.getIp(req);
  data.method = req.method;
  if (req.session) {
    data.sessionId = req.sessionID;
    data.entryPoint = req.session.entryPoint;
  }
  data.env = config.ENV;
  data.path = req.originalUrl;
  data.query = req.query;
  data.body = req.body;
  data.userAgent = req.get('User-Agent');
  data.env = config.ENV;
  data.timestamp = new Date();
  data.type = util.format('api:%s', name);
  return winston[level](name, data);
}
