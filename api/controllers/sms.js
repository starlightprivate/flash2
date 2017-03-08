/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

import Autopilot from 'autopilot-api';
import config from '../../server-config';
import xss from 'xss';

const autopilot = new Autopilot(config.autopilot.key);

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


async function sendSMS(req, res) {
  const {contactId} = req.params;
  const response = await autopilot.journeys.add('0001', xss(contactId));
  console.log(response);
  res.success();
}

async function sendSMS2(req, res) {
  const {contactid} = req.query;
  const response = await autopilot.journeys.add('0001', xss(contactid));
  console.log(response);
  res.success();
}

export default {
  sendSMS,
  sendSMS2,
};
