import config from '../../server-config';


// this is handler for testing various error reporters
// on production it will return 404 error
// on development or staging - it will throw error in
// most vicious way, breaking the application
// Related to Anatolij working on logging system

function testError(req, res) {
  if (config.ENV === 'production') {
    res.sendStatus(404);
  } else {
    throw new Error('testing error please ignore');
  }
}

export default testError;
