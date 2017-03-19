const winston = require('winston');

var transport = new (winston.transports.Console)({
  level: 'error', colorize: true });
var logger = new (winston.Logger)({
  transports: [transport]});

transport.level = 'error';

module.exports = logger;
