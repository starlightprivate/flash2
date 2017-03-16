import xss from 'xss';

function saveSession(req, res) {
  const valueName = xss(req.params.valueName);
  const valuePayload = xss(req.body.value).toString();
  req.session.custom = req.session.custom || {}; // eslint-disable-line no-param-reassign
  req.session.custom[valueName] = valuePayload; // eslint-disable-line no-param-reassign
  res
    .statusCode(201)
    .send('ok');
}

function loadSession(req, res) {
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


export default { saveSession, loadSession };
