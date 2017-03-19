#! /usr/bin/env node

'use strict';

const options = require('commander');
const snoopm = require('./../index.js');

options
.version('sNooPM-0.0.1')
.usage('[options] [package dir or url repository]  \n Pro-tip: On OS X Terminal Command Key + double_click must open the link on default browser')
.option('-v, --verbose','prints name, url and version')
.option('-c, --color','suprime colors aoutput')
.parse(process.argv);

snoopm(options);
