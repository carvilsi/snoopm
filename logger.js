const winston = require('winston');

var transport = new (winston.transports.Console)({
  level: 'warn', colorize: true });
var logger = new (winston.Logger)({
  transports: [transport]});

transport.level = 'warn';

module.exports = logger;
