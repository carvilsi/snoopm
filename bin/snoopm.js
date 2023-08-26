#! /usr/bin/env node

'use strict';

const  { program } = require('commander');
const snoopm  = require('./../index.js');
const version = require('./../package.json').version;

program
.version(version)
.usage('[options] [package dir or url repository]  \n\n  ProTip: On OS X Terminal Command Key + double_click must open the link on default browser')
.option('-v, --verbose','prints name, url and version (shows if there is newer version)')
.option('-c, --color','suprime colors output')
.option('-d, --dev','snooping devDependencies')
.option('-l, --lines','outputs lines instead table');

program.parse();
const options = program.opts();
snoopm(program.args, options);
