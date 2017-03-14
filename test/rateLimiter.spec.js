/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

/* global it, describe, process,before */

import supertest from 'supertest';
import whilst from 'async/whilst';
import util from 'util';

import app from '../app';
import redis from './../config/redis';


require('should');

const sessionIdCookieRegex = /^PHPSESSID=([^;]+); Path=\/; HttpOnly/;

function extractCookie(res, rgx) {
  const cookies = res.headers['set-cookie'];
  let val;
  let matched = false;
  cookies.map((c) => {
    if (!matched) {
      const results = rgx.exec(c);
      if (results) {
        val = results[1];
        matched = true;
      }
    }
    return null;
  });
  if (matched) {
    return val;
  }
  return false;
}

describe('RateLimiter', function () { //eslint-disable-line

  this.timeout(10000); // not everybody have good PC

  let
    sessionId;

  before(() => redis.flushdb());

  it('has anything on / but we need to start session properly to run tests', (done) => {
    supertest(app)
      .get('/')
      .expect('X-Powered-By', 'TacticalMastery')
      .end((error, res) => {
        if (error) {
          return done(error);
        }
        // console.log('/api/v2/ping cookies ',res.headers['set-cookie']);
        const sId = extractCookie(res, sessionIdCookieRegex);
        if (sId === false) {
          return done(new Error('PHPSESSID not set!'));
        }
        sessionId = sId;
        return done();
      });
  });

  it('allows to perform 100 requests', (done) => {
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
      () => count <= 99,
      (callback) => {
        supertest(app)
          .get('/api/v2/ping')
          .set('Cookie', [util.format('PHPSESSID=%s', sessionId)])
          .expect('X-Powered-By', 'TacticalMastery')
          .expect('X-RateLimit-Limit', '100')
          .expect('X-RateLimit-Remaining', /\d+/)
          .expect('X-RateLimit-Reset', /.*/)
          .expect(200, { msg: 'PONG' }, (err, response) => {
            if (err) {
              return callback(err);
            }
            count += 1;
            const remaining = response.headers['x-ratelimit-remaining'];
            /*
             console.log('N=%s  Code=%s  Body=%s - Remaining:%s',
             count,
             response.statusCode,
             JSON.stringify(response.body),
             remaining);
             */
            response.statusCode.should.be.equal(200);
            response.body.msg.should.be.equal('PONG');
            remaining.should.be.equal((100 - count).toString(10));

            return callback();
          });
      }, done);
  });

  it('fails as intended on 101 request', (done) => {
    supertest(app)
      .get('/api/v2/ping')
      .set('Cookie', [util.format('PHPSESSID=%s', sessionId)])
      .expect('X-Powered-By', 'TacticalMastery')
      .expect('X-RateLimit-Limit', '100')
      .expect('X-RateLimit-Remaining', '-1')
      .expect('X-RateLimit-Reset', /.*/) // anything goes
      .expect('Retry-After', /.*/) // anything goes
      .expect(429, 'Rate limit exceeded.', done);
  });
});
