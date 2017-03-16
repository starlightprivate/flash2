import xss from 'xss';

function saveSession(req, res) {
  const valueName = xss(req.params.valueName);
  const valuePayload = xss(req.body.value).toString();
  req.session.custom = req.session.custom || {}; // eslint-disable-line no-param-reassign
  req.session.custom[valueName] = valuePayload; // eslint-disable-line no-param-reassign
  return res.sendStatus(201);
}

function loadSession(req, res) {
  const key = xss(req.params.valueName);
  if (req.session) {
    req.session.custom = req.session.custom || {}; // eslint-disable-line no-param-reassign
    const data = req.session.custom[key];
    return res.success({ data });
  }
  const sessionId = xss(req.query.PHPSESSID);
  return req.sessionStore.load(sessionId, (err, sess) => {
    if (err) {
      console.error('error getting session', err); // eslint-disable-line
      // TODO more testing what errors can bubble up
    }
    if (sess) {
      return res.success({
        data: sess.custom[key],
      });
    }
    return res.success({ data: {} });
  });
}

function saveSessionAll(req, res) {
  req.session.custom = req.session.custom || {}; // eslint-disable-line no-param-reassign
  const dataToSave = req.body;
  Object.keys(dataToSave).map((x) => {
    req.session.custom[x] = xss(dataToSave[x]); // eslint-disable-line no-param-reassign
    return null;
  });
  return res.sendStatus(201);
}

function loadSessionAll(req, res) {
  if (req.session) {
    req.session.custom = req.session.custom || {}; // eslint-disable-line no-param-reassign
    return res.success({ data: req.session.custom });
  }
  const sessionId = xss(req.query.PHPSESSID);
  return req.sessionStore.load(sessionId, (err, sess) => {
    if (err) {
      console.error('error getting session', err); // eslint-disable-line
      // TODO more testing what errors can bubble up
    }
    if (sess) {
      return res.success({
        data: sess.custom || {},
      });
    }
    return res.success({ data: {} });
  });
}


export default {
  saveSession,
  loadSession,
  saveSessionAll,
  loadSessionAll,
};
