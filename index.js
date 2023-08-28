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
const url     = require('url');
const isUrl   = require('is-url');

const packageName = 'package.json';
const nodeModulesName = 'node_modules';
const npmView = 'npm view --json=true '; 
var logOutputFormat = 'default',
    options = {},
    table = new Table(),
    dataPromises = [],
    spinner,
    dep = {},
    opts;

function pushDependencies(dependencyObj) {
  var depKeys = Object.keys(dependencyObj);
  for (var i = 0; i < depKeys.length; i++) {
    dataPromises.push(getPackageData(depKeys[i]));
  }
}

async function readPackage(packageData) {
  try {
    parseCommandLine();
    if (opts.dev) {
      if (!packageData.devDependencies) {
        logger.warn('This package has not devDependencies');
        process.exit(42);
      }
      dep = packageData.devDependencies;
      pushDependencies(dep);
    } else {
      if (!packageData.dependencies) {
        logger.warn('This package has not dependencies. Try with -d');
        process.exit(42);
      }
      dep = packageData.dependencies;
      pushDependencies(dep);
    }

    await Promise.all(dataPromises)
    if (typeof opts.lines === 'undefined') {
      spinner.stop(true);
      console.log(table.toString());
    } else {
      spinner.stop(true);
    }
  } catch (e) {
    logger.error(e.stack);
    process.exit(42);
  }
}

function getPackageData(packageName) {
  return new Promise((resolve, reject) => {
    exec(npmView.concat(packageName), (error, stdout, stderr) => {
      if (!error && !stderr) {
        writeDown(JSON.parse(stdout));
        resolve(JSON.parse(stdout));
      } else if (error) {
        logger.error('Error reading package: ' + packageName);
        reject(error);
      }
    });
  });
}

function parseCommandLine() {
  if (opts.verbose && opts.color) {
    logOutputFormat = 'verbose-noColor';
    table = new Table({
      head:['name','Ver.','URL','Description']
    });
  } else if (opts.verbose && !opts.color) {
    logOutputFormat = 'verbose';
    table = new Table();
  } else if (!opts.verbose && opts.color) {
    logOutputFormat = 'default-noColor';
    table = new Table({
      head:['name','URL','Description']
    });
  } else if (opts.verbose && opts.dev) {
    table = new Table();
  } else if (opts.verbose && opts.dev && opts.color) {
    table = new Table({
      head:['name','Ver.','URL','Description']
    });
  } else {
    table = new Table();
  }
}

async function request(url) {
  try {
    const response = await axios.get(url)
    await readPackage(response.data);
  } catch (error) {
    throw new Error(`Invalid url provided: ${url}`);
  }
}

//TODO: consider to refactor the inline if, for readibility.
function writeDown(depData) {
  switch (logOutputFormat) {
    case 'verbose':
      var currentVersion = dep[depData.name];
      if (/^[\^\~].*/m.test(currentVersion)) {
        currentVersion = currentVersion.substring(1)
      }
      if (opts.lines) {
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
      if (opts.lines) {
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
      if (opts.lines) {
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
      if (opts.lines) {
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

function parseArgs(arg) {
  const par = path.parse(arg);
  var snooopmPath;
  
  if (par.base === '.' && par.name === '.' || 
      par.base === '' && par.name === '') { 
    snooopmPath = `${process.cwd()}/${packageName}`;
  }
  if (par.dir.indexOf(nodeModulesName) !== -1) { 
    if (par.root === '/') {
      if (par.base === packageName) {
        snooopmPath = `${par.dir}/${par.base}`;
      } else {
        snooopmPath = `${par.dir}/${par.base}/${packageName}`;
      }
    }
    if (par.root === '') {
      if (par.base === packageName) {
        snooopmPath = `${process.cwd()}/${par.dir}/${par.base}`;
      } else {
        snooopmPath = `${process.cwd()}/${par.dir}/${par.base}/${packageName}`;
      }
    }
  }
  if (typeof snooopmPath !== 'undefined') {
    return snooopmPath;
  } else {
    throw new Error(`Invalid provided path for: ${arg}`); 
  }
}

function parseUrl(prl) {
  const snoopmURL = new URL(prl);
  if (snoopmURL.host === 'github.com' ) {
    snoopmURL.host = 'raw.githubusercontent.com';
    if (snoopmURL.pathname.indexOf('package.json') === -1) {
      snoopmURL.pathname = `${snoopmURL.pathname}/master/package.json`;
    }
    if (snoopmURL.pathname.indexOf('package.json') !== -1) {
      snoopmURL.pathname = snoopmURL.pathname.replace('/blob','');
    }
  }
  return snoopmURL.toString();
}

var snoopm = async (args, options) => {
  try {
    spinner = new Spinner('SnOOping.. %s');
    spinner.setSpinnerString('==^^^^==||__');
    
    opts = options;
    
    // we want a clean output for lines option without the spinner 
    if (typeof opts.lines === 'undefined') {
      spinner.start();
    }
    
    const arg = !args.length ? '' : args[0];
    if (isUrl(arg)) {
      await request(parseUrl(arg));
    } else {
      await readPackage(require(parseArgs(arg)));
    }

    return snoopm;
  } catch (e) {
    logger.error(e);
    process.exit(42);
  }
}

module.exports = snoopm;

