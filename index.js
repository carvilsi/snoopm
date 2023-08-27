/**
 * SnOOpm 
 * snooping around code based on npm
 */

'use strict';

const fs      = require('fs');
const exec    = require('child_process').exec;
const path    = require('path');
const axios   = require('axios');
const colors  = require('colors');
const Table   = require('cli-table');
const Spinner = require('cli-spinner').Spinner;
const semver  = require('semver');
const logger  = require('logplease').create('SnOOpm');

const npmView = 'npm view --json=true '; 
var urls = [],
    logOutputFormat = 'default',
    options = {},
    table = new Table(),
    urlsPromises = [],
    spinner,
    dep = {},
    args;
const debug = false;

var readPackage = (packageData) => {
  try {
    parseCommandLine();
    if (this.options.dev) {
      if (!packageData.devDependencies) {
        logger.warn('This package has not devDependencies');
        process.exit(42);
      }
      dep = packageData.devDependencies;
      Object.keys(packageData.devDependencies).forEach((key)=>{
        urlsPromises.push(getUrlOfPackage(key));
      });
    } else {
      if (!packageData.dependencies) {
        logger.warn('This package has not dependencies. Try with -d');
        process.exit(42);
      }
      dep = packageData.dependencies;
      Object.keys(packageData.dependencies).forEach((key)=>{
        urlsPromises.push(getUrlOfPackage(key));
      });
    }

    Promise.all(urlsPromises)
    .then((res) => {
      if (typeof this.options.lines === 'undefined') {
        spinner.stop(true);
        console.log(table.toString());
      } else {
        spinner.stop(true);
      }
    });
  } catch (e) {
    logger.error(e.stack);
    process.exit(42);
  }
}

var getUrlOfPackage = (packageName) => {
  if (debug) console.log(`🐞 package name: ${packageName}`);
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
  axios.get(url).then((response)=>{
    try {
      readPackage(response.data);
    } catch (error) {
      logger.error('Invalid package.json provided by url');
      process.exit(42);
    }
  }).catch((error)=>{
    logger.error('Error requesting package.json');
  });
}

//TODO: consider to refactor the inline if, for readibility.
var writeDown = (depData) => {
  switch (this.logOutputFormat) {
    case 'verbose':
      var currentVersion = dep[depData.name];
      if (/^[\^\~].*/m.test(currentVersion)) {
        currentVersion = currentVersion.substring(1)
      }
      if (this.options.lines) {
        console.log(colors.gray(depData.name)
          .concat(' ; ')
          .concat(semver.lt(currentVersion,depData['dist-tags'].latest) ? 
            colors.red(`${currentVersion} --> ${depData['dist-tags'].latest}`) : 
            depData['dist-tags'].latest)
          .concat(' ; ')
          .concat(typeof depData.homepage === 'undefined' ? 
            '¬.¬ --> unknown, not available?' : 
            colors.underline(depData.homepage)
          .concat(' ; ').concat(colors.cyan(depData.description))));
      } else {
        table.push([
          colors.gray(depData.name)
          ,semver.lt(currentVersion,depData['dist-tags'].latest) ? 
            colors.red(`${currentVersion} --> ${depData['dist-tags'].latest}`) : 
            depData['dist-tags'].latest,
          typeof depData.homepage === 'undefined' ? 
            '¬.¬ --> unknown, not available?' : 
            colors.underline(typeof depData.homepage === 'undefined' ? 
            '¬.¬ --> unknown, not available?' : 
            depData.homepage),
          colors.cyan(depData.description.length>70 ? 
            depData.description.substring(0,70).concat('...') : 
            depData.description)
        ]);
      }
      break;
    case 'default-noColor':
      if (this.options.lines) {
        console.log(depData.name
          .concat(' ; ')
          .concat(typeof depData.homepage === 'undefined' ? 
            '¬.¬ --> unknown, not available?' : 
            depData.homepage)
          .concat(' ; ').concat(depData.description));
      } else {
        table.push([
          depData.name,
          typeof depData.homepage === 'undefined' ? 
            '¬.¬ --> unknown, not available?' : 
            depData.homepage,depData.description.length > 70 ? 
            depData.description.substring(0,70).concat('...') : 
            depData.description
        ]);
      }
      break;
    case 'verbose-noColor':
      if (this.options.lines) {
        console.log(depData.name
          .concat(' ; ')
          .concat(depData['dist-tags'].latest)
          .concat(' ; ')
          .concat(depData.homepage)
          .concat(' ; ')
          .concat(depData.description));
      } else {
        table.push([
          depData.name.toString(),
          depData['dist-tags'].latest.toString(),
          typeof depData.homepage === 'undefined' ? 
            '¬.¬ --> unknown, not available?' : 
            depData.homepage,
          depData.description.length > 70 ? 
            depData.description.substring(0,70)
            .concat('...') : 
            depData.description
        ]);
      }
      break;
    default:
      if (this.options.lines) {
        console.log(colors.gray(depData.name)
          .concat(' ; ')
          .concat(colors.underline(depData.homepage)
          .concat(' ; ')
          .concat(colors.cyan(depData.description))));
      } else {
        table.push([
          colors.gray(depData.name),
          colors.underline(depData.homepage),
          colors.cyan(depData.description.length > 70 ? 
            depData.description.substring(0,70)
            .concat('...') : 
            depData.description)
        ]);
      }
      break;
  }
}

var snoopm = (args, options) => {
  try {
    spinner = new Spinner('SnOOping.. %s');
    spinner.setSpinnerString('==^^^^==||__');
    this.options = options;
    if (typeof args === 'undefined') {
      this.args = [];
    } else {
      this.args = args;
    }

    //TODO: refactor this!
    // we want a clean output for lines option without the spinner 
    if (typeof this.options.lines === 'undefined') {
      spinner.start();
    }
    // we want to read the local package json file
    if (!this.args.length || this.args[0] === '.') {
        readPackage(require(process.cwd().concat('/package.json')));
    } else {
      if (path.basename(this.args[0]).trim() === 'package.json' 
          || this.args[0].indexOf('node_modules') !== -1) {
        if (this.args[0].indexOf('.') === 0 || this.args[0].indexOf('/') === 0) {
          var pathPackage = this.args[0];
          if (this.args[0].indexOf('package.json') === -1) {
            pathPackage = `${pathPackage}/package.json`; 
          }
          readPackage(require(pathPackage));
        }
        // url to json raw provided
        if (this.args[0].indexOf('http') === 0) {
          var url = this.args[0];
          if (url.indexOf('github.com') > 0) {
            url = url.replace('github.com','raw.githubusercontent.com');
            url = url.replace('blob/','');
          }
          requesting(url);
        }
      }
      // trying yo read package.json from git hub repository and master branch
      else if (this.args[0].indexOf('http') === 0) {
        var url = this.args[0];
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
    logger.error('Error 42');
    logger.error(e);
    process.exit(42);
  }
}

module.exports = snoopm;
