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
  req.session.custom = req.session.custom || {}; // eslint-disable-line no-param-reassign
  res.success({ data: req.session.custom });
}


export default { saveSession, loadSession };
