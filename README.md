<p align="center">
    <img src="https://github.com/carvilsi/snoopm/raw/master/images/logo.png" alt="snoopm" height="50px">
</p>

<p align="center">
    :dog: Snooping around Node.js code dependencies 
</p>

<p align="center">
    <img alt="npm" src="https://img.shields.io/npm/v/snoopm">
    <img alt="tst" src="https://github.com/carvilsi/snoopm/actions/workflows/tests.yml/badge.svg">
</p>

<p align="left">
    A cli to get at a glance what are the fundations of other Node.js code.
</p>

<p align="left">
Gives in a list the url and description for the dependencies.
</p>

<p align="left">
    Also it's possible to use it for your own code, e.g. to quick remember which dependency used in a project.
</p>

### Install

 `$ npm install snoopm -g`

### Usage

Usage: snoopm [options] [package dir or url repository]  

ProTip: On OS X Terminal Command Key + double_click must open the link on default browser

Options:

    -h, --help     output usage information
    -V, --version  output the version number, shows if there is newer version
    -v, --verbose  prints name, url and version (shows if there is newer version)
    -c, --color    no colors for output
    -d, --dev      snooping devDependencies
    -l, --lines    outputs lines instead table

### Examples

- Snooping local dependencies (same directory than source):

`$ snoopm .` or `$ snoopm`

![Alt vmware](https://github.com/carvilsi/snoopm/raw/master/images/local.png)

- Snooping remote dependencies by URL:

`$ snoopm https://github.com/remy/nodemon` or 
`$ snoop https://github.com/remy/nodemon/blob/main/package.json` or
`$ snoop https://raw.githubusercontent.com/remy/nodemon/main/package.json`

![Alt vmware](https://github.com/carvilsi/snoopm/raw/master/images/remote.png)

- Snooping with verbose output:

`$ snoopm -v .`

![Alt vmware](https://github.com/carvilsi/snoopm/raw/master/images/verbose.png)

- Snooping the development dependencies:

`$ snoopm -d .`

![Alt vmware](https://github.com/carvilsi/snoopm/raw/master/images/dev.png)

- Snooping and retriving lines as output; useful for post-processing:

`$ snoopm -l .`

![Alt vmware](https://github.com/carvilsi/snoopm/raw/master/images/lines.png)

- Supressing the colors of the output:

`$ snoopm -lc .`

![Alt vmware](https://github.com/carvilsi/snoopm/raw/master/images/color.png)

### Collaborators

SnOOpm **logo** made by [@psikoz](https://github.com/psikoz)
