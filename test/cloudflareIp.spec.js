/* global it, describe, process */

import rangeCheck from 'range_check';
import assert from 'assert';
import util from 'util';

// unit tests to prove https://starlightgroup.atlassian.net/browse/SG-35
// that middleware accepts only IPs from cloudflare servers

import security from './../api/middlewares/security';

function RequestMock(originatingIp) {
  this.headers = {
    'x-forwarded-for': originatingIp,
  };
  this.connection = {
    remoteAddress: originatingIp,
  };
  return this;
}


function ResponseMock(done) {
  // return res
  //   .status(500)
  //   .end('NOT OK');
  this.final = done;
}

ResponseMock.prototype.status = function (code) { // eslint-disable-line func-names
  this.code = code;
  return this;
};

ResponseMock.prototype.end = function (message) { // eslint-disable-line func-names
  this.message = message;
  this.final(null, this.code, this.message);
};


describe('security', () => {
  const invalidIp = '193.41.76.172';
  const validIp = '103.21.244.2'; // http://jodies.de/ipcalc?host=103.21.244.0&mask1=22&mask2=
  const ipRange = '103.21.244.0/22';

  describe('range_check', () => {
    it('it works for good ip', () => {
      assert(rangeCheck.inRange(validIp, ipRange));
    });

    it('it fails as intended for bad ip', () => {
      assert(!rangeCheck.inRange(invalidIp, ipRange));
    });
  });


  describe('#verifyThatSiteIsAccessedFromCloudflare', () => {
    it('is a function', () => {
      // eslint-disable-next-line no-unused-expressions
      assert.equal(typeof security.verifyThatSiteIsAccessedFromCloudflare, 'function');
    });

    it('do not works with IPv4 from not cloudflare', (done) => {
      const req = new RequestMock(invalidIp);
      const res = new ResponseMock((error, code, message) => {
        if (error) {
          return done(error);
        }
        assert.equal(code, 500);
        assert.equal(message, 'NOT OK');
        return done();
      });

      security.verifyThatSiteIsAccessedFromCloudflare(req, res, (error) => {
        if (error) {
          return done(error);
        }
        return null;
      });
    });


    it('do works with IPv4 from cloudflare 1', (done) => {
      const req = new RequestMock('103.22.200.23');
      const res = new ResponseMock((error, code, message) => {
        if (error) {
          return done(error);
        }
        return done(new Error(util.format('server responded with %s : %s', code, message)));
      });
      security.verifyThatSiteIsAccessedFromCloudflare(req, res, done);
    });

    it('do works with IPv4 from cloudflare 2', (done) => {
      const req = new RequestMock(validIp);
      const res = new ResponseMock((error, code, message) => {
        if (error) {
          return done(error);
        }
        return done(new Error(util.format('server responded with %s : %s', code, message)));
      });
      security.verifyThatSiteIsAccessedFromCloudflare(req, res, done);
    });


    it('do works with IPv4 from cloudflare 3', (done) => {
      const req = new RequestMock('197.234.240.21');
      const res = new ResponseMock((error, code, message) => {
        if (error) {
          return done(error);
        }
        return done(new Error(util.format('server responded with %s : %s', code, message)));
      });
      security.verifyThatSiteIsAccessedFromCloudflare(req, res, done);
    });

// https://www.ultratools.com/tools/ipv6CIDRToRangeResult?ipAddress=2400%3Acb00%3A%3A%2F32
    it('do works with valid IPv6 from cloudflare', (done) => {
      const req = new RequestMock('2400:cb00:0:0:0:0:0:1');
      const res = new ResponseMock((error, code, message) => {
        if (error) {
          return done(error);
        }
        return done(new Error(util.format('server responded with %s : %s', code, message)));
      });
      security.verifyThatSiteIsAccessedFromCloudflare(req, res, done);
    });
  });
});
