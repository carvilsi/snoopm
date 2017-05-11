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
const Table = require('cli-table');
const Spinner = require('cli-spinner').Spinner;

// const npmView = 'npm view --json=true ';
const npmView = 'npm view --json=true --fetch-retry-maxtimeout=45000 ';
var urls = [],
    logOutputFormat = 'default',
    options = {},
    table = new Table(),
    urlsPromises = [],
    spinner;


var readPackage = (packageData) => {

  try {
    parseCommandLine();
    if (this.options.dev) {
      if (!packageData.devDependencies) {
        logger.warn('This package has not devDependencies');
        process.exit();
      }
      Object.keys(packageData.devDependencies).forEach((key)=>{
        urlsPromises.push(getUrlOfPackage(key));
      });

    } else {
      Object.keys(packageData.dependencies).forEach((key)=>{
        urlsPromises.push(getUrlOfPackage(key));
      });
    }
    Promise.all(urlsPromises)
    .then((res) => {
      if (typeof this.options.lines == "undefined") {
        spinner.stop(true);
        console.log(table.toString());
      } else {
        spinner.stop(true);
      }
    });
  } catch (e) {
    logger.error(e.stack);
  }

}

var getUrlOfPackage = (packageName) => {
  return new Promise((resolve, reject) => {
    exec(npmView.concat(packageName), (error, stdout, stderr) => {
      if (!error && !stderr) {
        writeDown(JSON.parse(stdout));
        resolve(JSON.parse(stdout));
      } else
      if (error) {
        logger.error('Error reading package: ' + packageName);
        reject(error);
      }
    });
  });
}

var parseCommandLine = () => {
  if (this.options.verbose && this.options.color) {
    this.logOutputFormat = 'verbose-noColor';
    table = new Table({
      head:['name','Ver.','URL','Description']
    });
  } else
  if (this.options.verbose && !this.options.color) {
    this.logOutputFormat = 'verbose';
    table = new Table();
  } else
  if (!this.options.verbose && this.options.color) {
    this.logOutputFormat = 'default-noColor';
    table = new Table({
      head:['name','URL','Description']
    });
  } else
  if (this.options.verbose && this.options.dev) {
    table = new Table();
  } else
  if (this.options.verbose && this.options.dev && this.options.color) {
    table = new Table({
      head:['name','Ver.','URL','Description']
    });
  }
  else {
    table = new Table();
  }
}

var requesting = (url) => {
  request(url, (error, response, body) => {
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
  switch (this.logOutputFormat) {
    case 'verbose':
      if (this.options.lines) {
        console.log(colors.gray(depData.name).concat(' ; ').concat(depData['dist-tags'].latest).concat(' ; ').concat(typeof depData.homepage == 'undefined'?'¬.¬ --> unknown, not available?':colors.underline(depData.homepage).concat(' ; ').concat(colors.cyan(depData.description))));
      } else {
        table.push([colors.gray(depData.name),depData['dist-tags'].latest,typeof depData.homepage == 'undefined'?'¬.¬ --> unknown, not available?':colors.underline(typeof depData.homepage == 'undefined'?'¬.¬ --> unknown, not available?':depData.homepage),colors.cyan(depData.description.length>70?depData.description.substring(0,70).concat('...'):depData.description)]);
      }
      break;
    case 'default-noColor':
      if (this.options.lines) {
        console.log(depData.name.concat(' ; ').concat(typeof depData.homepage == 'undefined'?'¬.¬ --> unknown, not available?':depData.homepage).concat(' ; ').concat(depData.description));
      } else {
        table.push([depData.name,typeof depData.homepage == 'undefined'?'¬.¬ --> unknown, not available?':depData.homepage,depData.description.length>70?depData.description.substring(0,70).concat('...'):depData.description]);
      }
      break;
    case 'verbose-noColor':
      if (this.options.lines) {
        console.log(depData.name.concat(' ; ').concat(depData['dist-tags'].latest).concat(' ; ').concat(depData.homepage).concat(' ; ').concat(depData.description));
      } else {
        table.push([depData.name.toString(),depData['dist-tags'].latest.toString(),typeof depData.homepage == 'undefined'?'¬.¬ --> unknown, not available?':depData.homepage,depData.description.length>70?depData.description.substring(0,70).concat('...'):depData.description]);
      }
      break;
    default:
      if (this.options.lines) {
        console.log(colors.gray(depData.name).concat(' ; ').concat(colors.underline(depData.homepage).concat(' ; ').concat(colors.cyan(depData.description))));
      } else {
        table.push([colors.gray(depData.name),colors.underline(depData.homepage),colors.cyan(depData.description.length>70?depData.description.substring(0,70).concat('...'):depData.description)]);
      }
      break;
  }
}

var snoopm = (options) => {

  try {
    spinner = new Spinner('snooping.. %s');
    spinner.setSpinnerString('==^^^^==||__');
    this.options = options;
    if (typeof this.options.lines == "undefined") {
      spinner.start();
    }
    if (this.options.args.length === 0 ||
    this.options.args[0] == '.') {
        readPackage(require(process.cwd().concat('/package.json')));
    } else {
      if (path.basename(this.options.args[0]).trim() === 'package.json') {
        if (this.options.args[0].indexOf('.') === 0 ||
            this.options.args[0].indexOf('/') === 0
          ) {
          readPackage(require(this.options.args[0]));
        }
        /**
         * url to json raw provided
         */

        if (this.options.args[0].indexOf('http') === 0) {
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
        if (url.indexOf('github.com') > 0 && urlArr.length === 5) {
          url = url.replace('github.com','raw.githubusercontent.com');
          requesting(url.concat('/').concat('master').concat('/').concat('package.json'));
        }
      } else {
        throw new Error('no valid path or no valid url provided');
      }
    }
    return snoopm;

  } catch (e) {
    logger.error('Error 41');
    logger.error(e);
  }
}

module.exports = snoopm;
