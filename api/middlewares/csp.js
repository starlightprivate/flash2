import csp from 'helmet-csp';
import config from './../../server-config';

// This is Content Security Policy for site
// https://en.wikipedia.org/wiki/Content_Security_Policy

// it is timebomb that can break our site at every moment.
// Currently, we use wistia and segment.io as 3rd party libs.
// They give us to use quite big obfuscated code that is changed periodically
// And it gives `operation not permitted` errors in different parts of this file on different times
// So, we include code we do not own in frontend code, and we try to control it by CSP.
// And, at wistia or segment they can introduce changes to their script that break our site simply -
// csp will block it, frontend throws error, site not works.

// - Anatolij


const enableFullProtection = config.ENV === 'staging' || config.ENV === 'production';
// for now the CSP works in full power only on staging environment,
// enforcing CSP rules, not im reportOnly mode
// while it have to work on both `production` and `staging` one in enforce mode
// it is temporary measures, because we still recieving new CSP errors.
// if we enable it in enforcing mode, site can not work for some customers

// on staging and production environments application is working behind nginx.
// it has HTTPS support enabled
// and it sends header related to make browser use HTTPS only
// on development it do not do it.
const upgradeInsecureRequests = config.ENV === 'staging' || config.ENV === 'production';

// under construction
export default csp({
  // some examples
  //
  // Specify directives as normal.
  directives: {
    defaultSrc: [
      "'self'", // eslint-disable-line quotes
      'cdn.jsdelivr.net',
      '*.segment.com',
      'segment.com',
      '*.wistia.com',
      'cdn.segment.com/analytics.js',
      '*.akamaihd.net',
      'api.segment.io',
      'sentry.io/api/',
'*.youtube.com',
      'data:',
      'blob:',
    ],
    scriptSrc: [
      "'self'", // eslint-disable-line quotes
      // they say, it can be dangerous
      // to make vistia video work
      "'unsafe-inline'", // eslint-disable-line quotes
      "'unsafe-eval'", // eslint-disable-line quotes
      'ssl.google-analytics.com', // https://sentry.io/starlight-group/node-api/issues/241349780/
'*.fullstory.com',
'api.konnektive.com',
'*.konnektive.com',
'www.leadoutpost.com',
'*.leadoutpost.com',


// this all is loaded by Vistia widget
      'data:',
      'www.google-analytics.com',
      'api.segment.io',
      'cdn.ravenjs.com',
      'stats.g.doubleclick.net',
      'www.google.com/ads/ga-audiences',
// other code
      'cdn.jsdelivr.net',
      'cdn.rawgit.com',
      '*.wistia.com',
      'segment.com',
      '*.segment.com',
      'cdn.segment.com',
      '*.litix.io',
      // "'sha256-LC866cQ9tlE73BIp/WFYbgTYkS859vx0Hfk5RBVENLo='"

      'ajax.cloudflare.com', // https://sentry.io/starlight-group/node-api/issues/237652251/
      'amp.cloudflare.com', // https://sentry.io/starlight-group/node-api/issues/238457702/

    ],
    styleSrc: [
      "'self'", // eslint-disable-line quotes
      'cdn.jsdelivr.net',
      'fonts.googleapis.com',
      '*.segment.com',
// to make vistia video work
      "'unsafe-inline'", // eslint-disable-line quotes
      "'unsafe-eval'", // eslint-disable-line quotes

      // "'sha256-6EANf3q7TA3PzDpgLK8msCpC3+5Oq9al9X2vFTn/4Zo='",
      // "'sha256-7YxZjqgD/pE+dM1CMFFeuqfzrw5kL6AzVXgC130wbtc='",
      // "'sha256-68t8GdqcvIIBWHbcG8ZlsUUhN/8isFuMo7CI53+xcSM='"

      'amp.cloudflare.com', // https://sentry.io/starlight-group/node-api/issues/238457698/
    ],
    fontSrc: [
      "'self'", // eslint-disable-line quotes
      'fonts.gstatic.com',
      'cdn.jsdelivr.net',
      'fast.wistia.com/fonts/WistiaOpenSansSemiBold.woff',
      'data:',
    ],
    imgSrc: [
      "'self'", // eslint-disable-line quotes
      'data:',
      '*.akamaihd.net',
      '*.wistia.com',
      '*.litix.io',
      'www.google-analytics.com',
      'stats.g.doubleclick.net',
      'www.google.com',
      'www.google.ru',
      'www.google.fr',
      'www.google.co.in',
      'www.google.co.jp',
      'www.google.com.ar',
      'www.google.co.il',
      'www.google.de',
      'www.google.ca',
      'www.google.com.pk', // https://sentry.io/starlight-group/node-api/issues/237711249/
      'www.google.ie', // https://sentry.io/starlight-group/node-api/issues/241406270/
      'www.google.com.vn', // https://sentry.io/starlight-group/node-api/issues/240874666/
      'www.google.co.in', // https://sentry.io/starlight-group/node-api/issues/236475387/
      'www.google.com.tw', // https://sentry.io/starlight-group/node-api/issues/239112816/
      'www.google.es', // https://sentry.io/starlight-group/node-api/issues/242283604/
      'amp.cloudflare.com', // https://sentry.io/starlight-group/node-api/issues/242302468/
      'ssl.google-analytics.com', // https://sentry.io/starlight-group/node-api/issues/241349781/
    ],
frameSrc: [
'*.youtube.com',
],
    connectSrc: [
      "'self'", // eslint-disable-line quotes
      'cdn.jsdelivr.net',
      '*.segment.com',
      'segment.com',
      '*.wistia.com',
      'cdn.segment.com/analytics.js',
      '*.akamaihd.net',
      'api.segment.io',
      'sentry.io/api/',
'api.konnektive.com',
'*.konnektive.com',
'www.leadoutpost.com',
'*.leadoutpost.com',
'*.fullstory.com',
      'data:',
      'blob:',
    ],
//    sandbox: ['allow-forms', 'allow-scripts'],
    reportUri: 'https://sentry.io/api/133524/csp-report/?sentry_key=68ae2c197a6440efac407117aec0326f',

    // reportUri: '/a434819b5a5f4bfeeaa5d47c8af8ac87',
    // local system - doen't parse data all the time

    // reportUri: 'https://a434819b5a5f4bfeeaa5d47c8af8ac87.report-uri.io/r/default/csp/reportOnly',
    // https://report-uri.io/account/setup/

    // https://sentry.io/api/133524/csp-report/?sentry_key=68ae2c197a6440efac407117aec0326f
    // https://sentry.io/starlight-group/node-api/settings/keys/

    // seems like it works for reporto only?

    // objectSrc: ["'none'"],
    mediaSrc: [
      '\'self\'',
      'blob:',
      'data:',
      '*.wistia.com',
      'embedwistia-a.akamaihd.net', // https://sentry.io/starlight-group/node-api/issues/237778057/
    ],

    // on development environment, being run on http://localhost:8000
    // it makes download all scripts via HTTPS,while locally we serve site using HTTP and it fails
//    upgradeInsecureRequests,
  },

  // This module will detect common mistakes in your directives and throw errors
  // if it finds any. To disable this, enable "loose mode".
  loose: false,

  // Set to true if you only want browsers to report errors, not block them.
  // You may also set this to a function(req, res) in order to decide dynamically
  // whether to use reportOnly mode, e.g., to allow for a dynamic kill switch.
//  reportOnly: !enableFullProtection,
  reportOnly: false,
  // Set to true if you want to blindly set all headers: Content-Security-Policy,
  // X-WebKit-CSP, and X-Content-Security-Policy.
  setAllHeaders: false,

  // Set to true if you want to disable CSP on Android where it can be buggy.
  disableAndroid: false,

  // Set to false if you want to completely disable any user-agent sniffing.
  // This may make the headers less compatible but it will be much faster.
  // This defaults to `true`.
  browserSniff: true,
});
