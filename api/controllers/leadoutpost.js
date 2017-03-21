/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

import request from 'request-promise';
import xss from 'xss';
import phone from 'phone';
import Autopilot from 'autopilot-api';
import Analytics from 'analytics-node';

import trace from './../../risingStack';
import config from '../../server-config';
import logger from './../logger';
import security from './../middlewares/security';
import { mapToAutopilotJson, mapToLeadoutpostJson } from './mail';

// DO NOT REMOVE THIS COMMENT!!!
// I know that code is quite ugly in this file.
// Be carefull with changing it.
// We have unit tests that covers nearly all actions called by frontend code.
// But if you change code here, you will have to
// 1) verify that unit tests PASS (quite simple)
// 2) verify that frontend code is not broken. It is much more complicated task
// - frontend code has worse quality.
// - Anatolij


const autopilot = new Autopilot(config.autopilot.key);
// Segment analytics https://segment.com/docs/sources/server/node/
const segmentAnalytics = new Analytics(config.segmentWriteKey);


async function migrate(req, res) {
  let contacts = await autopilot.lists.roster(config.autopilot.clientlist, 'person_0E8607F2-E308-438F-BF16-FB627DB4A4C9');
  while (contacts.data.contacts.length >= 100) {
    let contact = {};
    for (contact of contacts.data.contacts) { // eslint-disable-line
      if (contact.Phone && phone(contact.Phone, 'US')[0]) {
        const leadoutpost = {
          firstName: contact.FirstName,
          lastName: contact.LastName,
          email: contact.Email,
          phone: contact.Phone,
        };
        leadoutpost.apiKey = config.leadoutpost.apiKey;
        leadoutpost.campaignId = config.leadoutpost.campaignId;
        const options = {
          uri: 'https://www.leadoutpost.com/api/v1/lead',
          qs: leadoutpost,
          headers: {
            'User-Agent': 'Request-Promise',
          },
          json: true, // Automatically parses the JSON string in the response
        };
        await request.post(options); // eslint-disable-line no-await-in-loop
        console.log(
          contact.contact_id,
          contact.Email,
          contact.Phone,
          contact.FirstName,
          contact.LastName);
      }
    }
// eslint-disable-next-line no-await-in-loop
    contacts = await autopilot.lists.roster(config.autopilot.clientlist, contact.contact_id);

    console.log('last----------------', contact.contact_id);
  }
  res.success({ length: contacts.data.contacts.length });
}

/*
 * add contact to autopilot
 *
 * req.body.Email
 * req.body.FirstName
 * req.body.LastName
 * req.body.Phone
 * req.body.MobilePhone
 * req.body.SkypeId
 * req.body.Browser
 *
 */

function addContact(req, res) {
  try {
    const leadoutpost = {
      firstName: xss(req.body.FirstName),
      lastName: xss(req.body.LastName),
      email: xss(req.body.Email),
      phone: xss(req.body.MobilePhone) || xss(req.body.Phone),
    };
    if (!req.body.MobilePhone) {
      req.body.MobilePhone = xss(req.body.Phone); // eslint-disable-line no-param-reassign
    }

    if (!req.body.Phone) {
      req.body.Phone = xss(req.body.MobilePhone); // eslint-disable-line no-param-reassign
    }
    // await sendAffiliateEmail(req.body);
    // eslint-disable-next-line no-underscore-dangle
    req.body._autopilot_list = config.autopilot.clientlist; // eslint-disable-line no-param-reassign
    autopilot.contacts.upsert(req.body);

    leadoutpost.apiKey = config.leadoutpost.apiKey;
    leadoutpost.campaignId = config.leadoutpost.campaignId;
    const options = {
      uri: 'https://www.leadoutpost.com/api/v1/lead',
      qs: leadoutpost,
      headers: {
        'User-Agent': 'Request-Promise',
      },
      json: true, // Automatically parses the JSON string in the response
    };
    return request
      .post(options)
      .then((data) => {
        logger('info', 'addContact', req, data); // TODO - think of data required for logs

        // https://segment.com/docs/sources/server/node/#identify
        segmentAnalytics.identify({
          userId: req.sessionID,
          traits: {
            FirstName: leadoutpost.firstName,
            LastName: leadoutpost.lastName,
            Email: leadoutpost.email,
            MobilePhone: leadoutpost.phone,
            userAgent: xss(req.get('User-Agent')),
            ip: security.getIp(req),
          },
        });

        trace.incrementMetric('addContact');
        return res.success();
      });
  } catch (error) {
    return res.error(error.message);
  }
}

function updateContact(req, res) {
  const contactData = mapToAutopilotJson(req.body);
  const leadoutpostData = mapToLeadoutpostJson(req.body);

  try {
    // await sendAffiliateEmail(req.body);
    // eslint-disable-next-line no-underscore-dangle
    contactData._autopilot_list = config.autopilot.clientlist;
    autopilot.contacts.upsert(contactData);

    leadoutpostData.apiKey = config.leadoutpost.apiKey;
    leadoutpostData.campaignId = config.leadoutpost.campaignId;

    const options = {
      uri: 'https://www.leadoutpost.com/api/v1/lead',
      qs: leadoutpostData,
      headers: {
        'User-Agent': 'Request-Promise',
      },
      json: true, // Automatically parses the JSON string in the response
    };
    return request
      .post(options)
      .then((data) => {
        logger('info', 'updateContact', req, data); // TODO - think of data required for logs
        trace.incrementMetric('updateContact');

        // https://segment.com/docs/sources/server/node/#identify
        segmentAnalytics.identify({
          userId: req.sessionID,
          traits: {
            FirstName: contactData.FirstName,
            LastName: contactData.LastName,
            Email: contactData.Email,
            MobilePhone: contactData.MobilePhone,
            MailingStreet: contactData.MailingStreet,
            MailingCity: contactData.MailingCity,
            MailingState: contactData.MailingState,
            MailingPostalCode: contactData.MailingPostalCode,
            userAgent: xss(req.get('User-Agent')),
            ip: security.getIp(req),
          },
        });
        return res.success();
      });
  } catch (error) {
    return res.error(error.message);
  }
}

function addLeadoutpost(req, res) {
  // TODO - this function is never used - it is commented in config/routes/v2.js
  req.body.apiKey = config.leadoutpost.apiKey; // eslint-disable-line no-param-reassign
  req.body.campaignId = config.leadoutpost.campaignId; // eslint-disable-line no-param-reassign
  const options = {
    uri: 'https://www.leadoutpost.com/api/v1/lead',
    qs: req.body,
    headers: {
      'User-Agent': 'Request-Promise',
    },
    json: true, // Automatically parses the JSON string in the response
  };

  return request
    .post(options)
    .then((data) => {
      logger('info', 'addLeadoutpost', req, data); // TODO - think of data required for logs
      trace.incrementMetric('addLeadoutpost');
      return res.send(data);
    });
}

export default {
  migrate,
  addContact,
  updateContact,
  addLeadoutpost,
};
