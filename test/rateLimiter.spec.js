'use strict';
/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

/* global it, describe, process */

import supertest from 'supertest';
import app from '../app.js';
import util from 'util';
import whilst from 'async/whilst';

require('should');

const sessionIdCookieRegex = /^PHPSESSID\=([^\;]+)\; Path=\/\; HttpOnly/;

function extractCookie(res, rgx) {
  let
    cookies = res.headers['set-cookie'],
    val,
    matched = false;
  cookies.map(function (c) {
    if (!matched) {
      let results = rgx.exec(c);
      if (results) {
        val = results[1];
        matched = true;
      }
    }
  });
  if (matched) {
    return val;
  }
  return false;
}

describe('RateLimiter', function () {
  let
    sessionId;

  it('has anything on / but we need to start session properly to run tests', function (done) {
    supertest(app)
      .get('/')
      .expect('X-Powered-By', 'TacticalMastery')
      .end(function (error, res) {
        if (error) {
          return done(error);
        }
        // console.log('/api/v2/ping cookies ',res.headers['set-cookie']);
        let sId = extractCookie(res, sessionIdCookieRegex);
        if (sId === false) {
          return done(new Error('PHPSESSID not set!'));
        }
        sessionId = sId;
        done();
      });
  });

  it('allows to perform 100 requests', function (done) {
    let count = 0;

    // var count = 0;
    // async.whilst(
    //   function() { return count < 5; },
    //   function(callback) {
    //     count++;
    //     setTimeout(function() {
    //       callback(null, count);
    //     }, 1000);
    //   },
    //   function (err, n) {
    //     // 5 seconds have passed, n = 5
    //   }
    // );

    whilst(
      function () {
        return count <= 102;
      },
      function (callback) {
        count++;
        supertest(app)
          .get('/api/v2/ping')
          .set('Cookie', [util.format('PHPSESSID=%s', sessionId)])
          .expect('X-Powered-By', 'TacticalMastery')
          .expect('X-RateLimit-Limit', '60000')
          .expect('X-RateLimit-Remaining', /\d+/)
          .expect('X-RateLimit-Reset', /.*/)
          .expect(200, {msg: 'PONG'},callback);
      },
      function (err) {
        if (err) {
          done(err);
        }
        count.should.be.equal(101); //it have to fail on 101 request!
        done();
      }
    );
  });

  it('fails as intended on 101 request', function (done) {
    supertest(app)
      .get('/api/v2/ping')
      .set('Cookie', [util.format('PHPSESSID=%s', sessionId)])
      .expect('X-Powered-By', 'TacticalMastery')
      .expect('X-RateLimit-Limit', '60000')
      .expect('X-RateLimit-Remaining', /\d+/)
      .expect('X-RateLimit-Reset', /.*/) //anything goes
      // .expect('Retry-After', /.*/) //anything goes
      .expect(429, {msg: 'PONG'}, done);
  });
});
