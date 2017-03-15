import xss from 'xss';
import util from 'util';
import request from 'request-promise';

import trace from './../../risingStack';
import config from '../../server-config';
import logger from './../logger';
// const autopilot = new Autopilot(config.autopilot.key);

// DO NOT REMOVE THIS COMMENT!!!
//  I know that code is quite ugly in this file.
//  Be carefull with changing it.
//  We have unit tests that covers nearly all actions called by frontend code.
//  But if you change code here, you will have to
//  1) verify that unit tests PASS (quite simple)
//  2) verify that frontend code is not broken.
//  It is much more complicated task - frontend code has worse quality.
//
//
//  - Anatolij


// On development environment we use proxy to connective api.
// It is more secure (source code do not have Konnective API login and password, that gave full
// permissions to edit database of Konnective via API exposed.
// But proxy add some lags and it is bad for production.
// Source code of proxy - https://github.com/starlightgroup/starlightproxy
// Proxy deployed on https://starlightproxy.herokuapp.com/ (temporary)

// On staging and production environments Konnective API is used without proxy.

let connectiveApiURL;
let proxyApiKey;
let konnectiveLogin;
let konnectivePassword;
const useProxy = config.ENV === 'development';

if (useProxy) {
  connectiveApiURL = config.konnective.proxy;
  proxyApiKey = config.konnective.proxyApiKey;
} else {
  connectiveApiURL = 'https://api.konnektive.com/';
  konnectiveLogin = config.konnective.loginId;
  konnectivePassword = config.konnective.password;
}


async function addKonnektiveOrder(req, res) {
  const body = {};

  if (!req.body.cardNumber || !req.body.cardMonth || !req.body.cardYear) {
    return res.error('Invalid Card Details');
  }

  body.address1 = xss(req.body.address1);
  body.address2 = xss(req.body.address2);
  body.campaignId = xss(req.body.campaignId);
  body.cardMonth = xss(req.body.cardMonth);
  body.cardNumber = xss(req.body.cardNumber).replace(/\s/g, '');
  body.cardYear = xss(req.body.cardYear);
  body.city = xss(req.body.city);
  body.emailAddress = xss(req.body.emailAddress);
  body.firstName = xss(req.body.firstName);
  body.lastName = xss(req.body.lastName) || 'NA';
  body.orderId = xss(req.body.orderId);
  body.phoneNumber = xss(req.body.phoneNumber);
  body.postalCode = xss(req.body.postalCode);
  body.productId = xss(req.body.productId);
  body.state = xss(req.body.state);
  body.country = 'US';
  body.billShipSame = 1;

  if (req.body.cardSecurityCode) {
    delete req.body.cardSecurityCode; // eslint-disable-line no-param-reassign
  }
  // req.body.cardSecurityCode = '100';

  body.campaignId = 3;
  body.paySource = 'CREDITCARD';
  body.product1_qty = 1;
  body.product1_id = req.body.productId;
  // body.lastName = req.body.lastName || 'NA';
  // req.body.cardExpiryDate = `${req.body.month}/${req.body.year}`;
  // delete req.body.productId;

  if (!useProxy) {
    body.loginId = konnectiveLogin;
    body.password = konnectivePassword;
  }
// documentation for api
// https://api.konnektive.com/docs/order_import/
  const options = {
    method: 'GET',
    uri: util.format('%s%s', connectiveApiURL, 'order/import/'),
    qs: body,
    headers: {
      'api-key': proxyApiKey,
      'User-Agent': 'Request-Promise',
    },
    json: true, // Automatically parses the JSON string in the response
  };

  const response = await request(options);
  // console.log(response);
  // TODO - think of data required for logs
  trace.incrementMetric('konnectiveNewOrder');
  logger('info', 'konnectiveNewOrder', req, {
    country: 'US',
    state: body.state,
    city: body.city,
    address1: body.address1,
    address2: body.address2,
    postalCode: body.postalCode,

    campaignId: body.campaignId,
    firstName: body.firstName,
    lastName: body.lastName,
    emailAddress: body.emailAddress,
    apiResponse: JSON.stringify(response), //verify it do not have sensitive data like CC numbers
  });

  if (response.result === 'ERROR') {
    return res.error(response.message, 200);
  }
  req.session.orderId = response.message.orderId; // eslint-disable-line no-param-reassign
  return res.success(response.message);
}

function getLead(req, res) {
  const id = req.session.orderId;
  if (!id) {
    return res.error('bad response');
  }

// documentation for api
// https://api.konnektive.com/docs/order_query/

  const options = {
    method: 'GET',
    uri: util.format('%sorder/query/', connectiveApiURL),
    qs: {
      loginId: konnectiveLogin,
      password: konnectivePassword,
      orderId: id,
    },
    headers: {
      'api-key': proxyApiKey,
      'User-Agent': 'Request-Promise',
    },
    json: true, // Automatically parses the JSON string in the response
  };
  return request(options)
    .then((response) => {
      // console.log('raw response', response);
      if (response.result === 'ERROR') {
        return res.error(response.message);
      }
      logger('info', 'getLead', req, {
        orderId: id,
      }); // TODO - think of data required for logs
      return res.success(response.message);
    })
    .catch((err) => {
      logger('error', 'getLead', req, {
        err,
        orderId: id,
      }); // TODO - think of data required for logs
      return res.error('bad response');
    });
}

function getTrans(req, res) {
  const id = req.session.orderId;
  if (!id) {
    return res.error('bad response');
  }

  const options = {
    method: 'GET',
    uri: util.format('%stransactions/query/', connectiveApiURL),
    qs: {
      loginId: konnectiveLogin,
      password: konnectivePassword,
      orderId: id,
    },
    headers: {
      'api-key': proxyApiKey,
      'User-Agent': 'Request-Promise',
    },
    json: true, // Automatically parses the JSON string in the response
  };
  return request(options)
    .then((response) => {
      // console.log('raw response', response);
      if (response.result === 'ERROR') {
        return res.error(response.message);
      }
      // TODO - think of data required for logs
      logger('info', 'getTrans', req, {
        orderId: id,
      });
      return res.success(response.message);
    })
    .catch((err) => {
      logger('error', 'getTrans', req, {
        err,
        orderId: id,
      }); // TODO - think of data required for logs
      return res.error('bad response');
    });
}

async function createKonnektiveLead(req, res) {
  // console.log('createKonnektiveLead create-lead...');

  const campaignId = 3;

  const body = {};
  body.campaignId = campaignId;

  body.firstName = xss(req.body.firstName);
  body.lastName = xss(req.body.lastName) || 'NA';
  body.phoneNumber = xss(req.body.phoneNumber);
  body.emailAddress = xss(req.body.emailAddress) || config.email;

  // console.log(body);

  if (!useProxy) {
    body.loginId = konnectiveLogin;
    body.password = konnectivePassword;
  }
  // documentation on api
  // https://api.konnektive.com/docs/leads_import/
  const options = {
    uri: util.format('%sleads/import/', connectiveApiURL),
    qs: body,
    headers: {
      'api-key': proxyApiKey,
      'User-Agent': 'Request-Promise',
    },
    json: true, // Automatically parses the JSON string in the response
  };
  const response = await request(options);
  // console.log('response...', response);
  if (response.result === 'ERROR') {
    return res.error(response.message);
  }
  trace.incrementMetric('createKonnektiveLead');
  logger('info', 'createKonnektiveLead', req, {
    firstName: body.firstName,
    lastName: body.lastName,
    phoneNumber: body.phoneNumber,
    emailAddress: body.emailAddress,
    apiResponse: JSON.stringify(response),
  }); // TODO - think of data required for logs
  return res.success(response.message);
}


async function upsell(req, res) {
  const { productId, productQty } = req.body;
  if (!productId || !productQty) {
    return res.error('Invalid Upsell Data');
  }
  // console.log('Preparing to send data to /upsale/import', req.body);
  if (!useProxy) {
    req.body.loginId = konnectiveLogin; // eslint-disable-line no-param-reassign
    req.body.password = konnectivePassword; // eslint-disable-line no-param-reassign
  }
  // documentation on api
  // https://api.konnektive.com/docs/upsale_import/

  const options = {
    uri: util.format('%supsale/import/', connectiveApiURL),
    qs: req.body,
    headers: {
      'api-key': proxyApiKey,
      'User-Agent': 'Request-Promise',
    },
    json: true, // Automatically parses the JSON string in the response
  };
  const response = await request(options);
  // console.log(response);
  trace.incrementMetric('upsell');
  logger('info', 'upsell', req, {
    data: req.body, // probably something have to be filtered?
    apiResponse: JSON.stringify(response),
  }); // TODO - think of data required for logs
  if (response.result === 'ERROR') {
    return res.error(response.message);
  }
  return res.success(response.message);
}

export default {
  getLead,
  addKonnektiveOrder,
  createKonnektiveLead,
  upsell,
  getTrans,
};
