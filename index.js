/**
 * sNooPM
 * snooping around code based on npm
 */


'use strict';

const fs = require('fs');
const exec = require('child_process').exec;
const logger = require('./logger');
const path = require('path');
const request = require('request');
const colors = require('colors');

const npmView = 'npm view --json=true ';
var urls = [],
    logOutputFormat = 'default',
    options = {};


var readPackage = (packageData) => {
  try {
    Object.keys(packageData.dependencies).forEach((key)=>{
      logger.debug(key);
      getUrlOfPackage(key);
    });
  } catch (e) {
    return e;
  }
}

var getUrlOfPackage = (packageName) => {
  exec(npmView.concat(packageName), (error, stdout, stderr) => {
    if (!error && !stderr) {
      logger.debug(JSON.parse(stdout).name);
      logger.debug(JSON.parse(stdout).homepage);
      writeDown(JSON.parse(stdout));
    } else {
      logger.error('Error reading package: ' + packageName);
    }
  });
}

var parseCommandLine = () => {
  if (this.options.verbose && this.options.color) this.logOutputFormat = 'verbose-noColor';
  if (this.options.verbose && !this.options.color) this.logOutputFormat = 'verbose';
  if (!this.options.verbose && this.options.color) this.logOutputFormat = 'default-noColor';
}

var requesting = (url) => {
  logger.debug(url);

  request(url, (error, response, body) => {
    logger.debug(body);
    if (error) {
      logger.error('Error requesting package.json');
    } else {
      try {
        readPackage(JSON.parse(body));
      } catch (e) {
        logger.error('Invalid package.json provided by url');
      }
    }
  });
}

var writeDown = (depData) => {

  parseCommandLine();

  switch (this.logOutputFormat) {
    case 'verbose':
      console.log(colors.gray(depData.name).concat(' ; ').concat(depData['dist-tags'].latest).concat(' ; ').concat(colors.underline(depData.homepage).concat(' ; ').concat(colors.cyan(depData.description))));
      break;
    case 'default-noColor':
      console.log(depData.name.concat(' ; ').concat(depData.homepage).concat(' ; ').concat(depData.description));
      break;
    case 'verbose-noColor':
      console.log(depData.name.concat(' ; ').concat(depData['dist-tags'].latest).concat(' ; ').concat(depData.homepage).concat(' ; ').concat(depData.description));
      break;
    default:
      console.log(colors.gray(depData.name).concat(' ; ').concat(colors.underline(depData.homepage).concat(' ; ').concat(colors.cyan(depData.description))));
      break;
  }
}

var snoopm = (options) => {
  try {

    this.options = options;
    if (this.options.args.length === 0) {
      logger.debug('no path or url provided, trying to get dependencies from local package.json');
      var packageData = require('./package.json');
      if (packageData) {
        readPackage(packageData);
      } else {
        logger.warn('no path, no url or local package.json');
      }
    } else {
      logger.debug(this.options.args[0]);
      if (path.basename(this.options.args[0]).trim() === 'package.json') {
        if (this.options.args[0].indexOf('.') === 0 || this.options.args[0].indexOf('/') === 0) {
          readPackage(require(this.options.args[0]));
        }
        /**
         * url to json raw provided
         */

        if (this.options.args[0].indexOf('http') === 0) {
          logger.debug('url');
          var url = this.options.args[0];
          if (url.indexOf('github.com') > 0) {
            url = url.replace('github.com','raw.githubusercontent.com');
            url = url.replace('blob/','');
          }
          requesting(url);
        }
      }
      /**
       * trying yo read package.json from git hub repository and master branch
       */

      else if (this.options.args[0].indexOf('http') === 0) {
        var url = this.options.args[0];
        var urlArr = url.split('\/');
        logger.debug(urlArr);
        logger.debug(urlArr.length);
        if (url.indexOf('github.com') > 0 && urlArr.length === 5) {
          url = url.replace('github.com','raw.githubusercontent.com');
          logger.debug(url);
          requesting(url.concat('/').concat('master').concat('/').concat('package.json'));
        }
      } else {
        logger.warn('no valid path or no valid url provided');
      }
    }

    return snoopm;

  } catch (e) {
    logger.error('Error 41');
    logger.error(e);
  }
}

module.exports = snoopm;
