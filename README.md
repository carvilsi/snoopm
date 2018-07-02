<p align="left"><img src="logo.png" alt="snoopm" height="50px"></p>

Snooping around code based on npm.

[![NPM](https://nodei.co/npm/snoopm.png?compact=true)](https://nodei.co/npm/<package>/)

This node script lists url and description for all npm dependencies.

![Alt vmware](https://github.com/carvilsi/snoopm/raw/master/img.png)

### Install

 `$ npm install snoopm -g`


### Usage

Usage: snoopm [options] [package dir or url repository]  

ProTip: On OS X Terminal Command Key + double_click must open the link on default browser

Options:

    -h, --help     output usage information
    -V, --version  output the version number
    -v, --verbose  prints name, url and version
    -c, --color    no colors for output
    -d, --dev      snooping devDependencies
    -l, --lines    outputs lines instead table


**Example**

`$ snoopm https://github.com/remy/nodemon`
