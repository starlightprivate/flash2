export default (req, res, next) => {
  res.error = (message, code = 200, showToUser = true) => { // eslint-disable-line no-param-reassign
    if (code === 'EBADCSRFTOKEN') {
      code = 403; // eslint-disable-line no-param-reassign
      message = 'Invalid API Key'; // eslint-disable-line no-param-reassign
    }
    return res.status(code).json({
      success: false,
      error: message,
      message,
      showToUser,
    });
  };
  next();
};
