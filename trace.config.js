// trace.config.js
const config = require('./server-config');
const util = require('util');

module.exports = {
  serviceName: util.format('flash2 - %s', config.ENV),
  apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU4OTMxMmYzZmRjNGYwMDAwMWIwMDFlYiIsImlhdCI6MTQ4NjAzMzY1MX0.yk1v5JRIRNMA34zZnRemRbnOFluKmusXNc9K00nhJ-g',
};
