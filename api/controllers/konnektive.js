/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */
// import Autopilot from 'autopilot-api';
import request from 'request-promise';
import config from '../../server-config';
import xss from 'xss';
import util from 'util';

// const autopilot = new Autopilot(config.autopilot.key);

/*
 * DO NOT REMOVE THIS COMMENT!!!
 * I know that code is quite ugly in this file.
 * Be carefull with changing it.
 * We have unit tests that covers nearly all actions called by frontend code.
 * But if you change code here, you will have to
 * 1) verify that unit tests PASS (quite simple)
 * 2) verify that frontend code is not broken. It is much more complicated task - frontend code has worse quality.
 *
 *
 * - Anatolij
 */


//On development environment we use proxy to connective api.
//It is more secure (source code do not have Konnective API login and password, that gave full
//permissions to edit database of Konnective via API exposed.
//But proxy add some lags and it is bad for production.
//Source code of proxy - https://github.com/starlightgroup/starlightproxy
//Proxy deployed on https://starlightproxy.herokuapp.com/ (temporary)

//On staging and production environments Konnective API is used without proxy.

let connectiveApiURL;
let proxyApiKey;
let konnectiveLogin;
let konnectivePassword;
let useProxy = config.ENV === 'development';

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

  if (!req.body.shipAddress1) {
    body['shipAddress1'] = body['address1'];
    body['shipAddress2'] = body['address2'];
    body['shipCity'] = body['city'];
    body['shipState'] = body['state'];
    body['shipPostalCode'] = body['postalCode'];
    body['shipCountry'] = body['country'];
  }

  if (req.body.cardSecurityCode) {
    delete req.body.cardSecurityCode;
  }
  //req.body.cardSecurityCode = '100';

  body.campaignId = 3;
  body.paySource = 'CREDITCARD';
  body.product1_qty = 1;
  body.product1_id = req.body.productId;
  //body.lastName = req.body.lastName || 'NA';
  //req.body.cardExpiryDate = `${req.body.month}/${req.body.year}`;
  //delete req.body.productId;

  const options = {
    method: 'GET',
    uri: util.format('%s%s', connectiveApiURL, 'order/import/'),
    qs: body,
    headers: {
      'api-key':proxyApiKey,
      'User-Agent': 'Request-Promise',
    },
    json: true // Automatically parses the JSON string in the response
  };

  const response = await request(options);
  console.log(response);

  if (response.result == 'ERROR') {
    res.error(response.message, 200);
  }
  else {
    res.success(response.message);
  }
}

async function getLead(req, res) {
  const orderId = xss(req.params.id);
  const options = {
    method: 'GET',
    uri: util.format('%sorder/query/', connectiveApiURL),
    qs: {
      loginId: konnectiveLogin,
      password: konnectivePassword,
      orderId: orderId
    },
    headers: {
      'api-key':proxyApiKey,
      'User-Agent': 'Request-Promise',
    },
    json: true // Automatically parses the JSON string in the response
  };

  const response = JSON.parse(await request(options));
  console.log(response);
  if (response.result == 'ERROR') {
    res.error(response.message);
  }
  else {
    res.success(response.message);
  }
}

async function getTrans(req, res) {
  const orderId = xss(req.params.id);
  const options = {
    method: 'GET',
    uri: util.format('%stransactions/query/', connectiveApiURL),
    qs: {
      loginId: konnectiveLogin,
      password: konnectivePassword,
      orderId: orderId
    },
    headers: {
      'api-key':proxyApiKey,
      'User-Agent': 'Request-Promise',
    },
    json: true // Automatically parses the JSON string in the response
  };
  const response = JSON.parse(await request(options));
  if (response.result == 'ERROR') {
    res.error(response.message);
  }
  else {
    res.success(response.message);
  }
}

async function createKonnektiveLead(req, res) {

  console.log('createKonnektiveLead create-lead...');

  const campaignId = 3;

  const body = {};
  body.campaignId = campaignId;

  body.firstName = xss(req.body.firstName);
  body.lastName = xss(req.body.lastName) || 'NA';
  body.phoneNumber = xss(req.body.phoneNumber);
  body.emailAddress = xss(req.body.emailAddress) || config.email;

  console.log(body);

  body.loginId = konnectiveLogin;
  body.password = konnectivePassword;

  const options = {
    uri: util.format('%sleads/import/', connectiveApiURL),
    qs: body,
    headers: {
      'api-key':proxyApiKey,
      'User-Agent': 'Request-Promise'
    },
    json: true // Automatically parses the JSON string in the response
  };
  const response = await request(options);
  console.log('response...', response);
  if (response.result == 'ERROR') {
    res.error(response.message);
  }
  else {
    res.success(response.message);
  }
}


async function upsell(req, res) {
  const {productId, productQty/*, orderId */} = req.body;
  if (!productId || !productQty) {
    res.error('Invalid Upsell Data');
  }
  else {
    console.log('Preparing to send data to /upsale/import', req.body);
    req.body.loginId = konnectiveLogin;
    req.body.password = konnectivePassword;
    const options = {
      uri: util.format('%supsale/import/', connectiveApiURL),
      qs: req.body,
      headers: {
        'api-key':proxyApiKey,
        'User-Agent': 'Request-Promise'
      },
      json: true // Automatically parses the JSON string in the response
    };
    const response = await request(options);
    console.log(response);
    if (response.result == 'ERROR') {
      res.error(response.message);
    }
    else {
      res.success(response.message);
    }
  }
}

export default {
  getLead: getLead,
  addKonnektiveOrder: addKonnektiveOrder,
  createKonnektiveLead: createKonnektiveLead,
  upsell: upsell,
  getTrans: getTrans
};
