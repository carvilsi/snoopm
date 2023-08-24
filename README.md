<p align="center">
    <img src="logo.png" alt="snoopm" height="50px">
</p>

<p align="center">
    :dog: Snooping around Node.js code dependencies 
</p>

<p align="left">
A cli to get at a glance what are the fundations of other Node.js code.
</p>

<p align="left">
Gives in a list the url and description for the dependencies.
Also it's possible to use it for your own code, e.g. to quick remember which dependency used in a project.
</p>

![Alt vmware](https://github.com/carvilsi/snoopm/raw/master/img.png)

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

- Snooping the great **nodemon** dependencies by **repo URL** 

`$snoopm https://github.com/remy/nodemon`

### Collaborators
sNooPM **logo** made by [@psikoz](https://github.com/psikoz)
