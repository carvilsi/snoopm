import {execa} from 'execa';
import {assert} from 'chai';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pckg = require("./../package.json");

const snoopmDependencies = ['axios','cli-spinner','cli-table','colors','commander','logplease','semver'];
const snoopmDevDependencies = ['chai','mocha','execa'];

const pathPackageNodeModule = './node_modules/snoopm/package.json'
const pathPackageNodeModuleDir = './node_modules/snoopm/'

function assertDependencies(stdout, dependencies) {
  for (var i = 0; i < dependencies.length; i++) {
    let exists = stdout.indexOf(dependencies[i]);
    assert.notEqual(exists, -1, `${dependencies[i]} snoopm dependency must be at [${dependencies}]`);
  }
}

describe('SnOOpm local', async ()=> {

  it('should retieve version', async () => {
    const {stdout} = await execa('./bin/snoopm.js', ['--version']);
    assert.equal(stdout, pckg.version, `version should be ${pckg.version}`);
  });
  
  it('should retieve default table output for snooping on local package.json no arguments', async () => {
    const {stdout} = await execa('./bin/snoopm.js');
    // only print the output once.
    console.log(stdout);
    // try to assert things like urls and descriptions is not safe, because could change.
    assertDependencies(stdout, snoopmDependencies); 
  });
 
  it('should retieve default table output for snooping on local package.json argument "."', async () => {
    const {stdout} = await execa('./bin/snoopm.js', ['.']);
    assertDependencies(stdout, snoopmDependencies);
  });
  
  it('should retieve list output for snooping on local package.json argument "-l"', async () => {
    const {stdout} = await execa('./bin/snoopm.js', ['-l']);
    console.log(stdout);
    assert.equal(stdout.indexOf('┌────'), -1, 'should not contain table');
    assertDependencies(stdout, snoopmDependencies);
  });
 
  it('should retieve default table output with dev-dependencies for snooping on local package.json dev-dependencies argument "-d"', async () => {
    const {stdout} = await execa('./bin/snoopm.js', ['-d']);
    console.log(stdout);
    assertDependencies(stdout, snoopmDevDependencies); 
  });
 
  it('should retieve default table output with dev-dependencies for snooping on local package.json dev-dependencies argument "-d ."', async () => {
    const {stdout} = await execa('./bin/snoopm.js', ['-d', '.']);
    assertDependencies(stdout, snoopmDevDependencies);
  });
  
  it('should retieve list of dev-dependencies output for snooping on local package.json argument "-ld"', async () => {
    const {stdout} = await execa('./bin/snoopm.js', ['-ld']);
    console.log(stdout);
    assert.equal(stdout.indexOf('┌────'), -1, 'should not contain table');
    assertDependencies(stdout, snoopmDevDependencies);
  });

  it('should retieve default table output verbose for snooping on local package.json argument "-v"', async () => {
    var {stdout} = await execa('./bin/snoopm.js', ['-v']);
    console.log(stdout);
    assertDependencies(stdout, snoopmDependencies);
    assert.notEqual(stdout.indexOf(pckg.dependencies[snoopmDependencies[0]].substring(1)), -1, 'should find the dependency version');
  });

  it('should retieve dev-dependencies table output verbose for snooping on local package.json argument "-dv"', async () => {
    var {stdout} = await execa('./bin/snoopm.js', ['-dv']);
    console.log(stdout);
    assertDependencies(stdout, snoopmDevDependencies);
    assert.notEqual(stdout.indexOf(pckg.devDependencies[snoopmDevDependencies[0]].substring(1)), -1, 'should find the dev-dependency version');
  }); 

  it('should retieve list output verbose for snooping on local package.json argument "-lv"', async () => {
    var {stdout} = await execa('./bin/snoopm.js', ['-lv']);
    console.log(stdout);
    assertDependencies(stdout, snoopmDependencies);
    assert.equal(stdout.indexOf('┌────'), -1, 'should not contain table');
    assert.notEqual(stdout.indexOf(pckg.dependencies[snoopmDependencies[0]].substring(1)), -1, 'should find the dependency version');
  });
 
  it('should retieve dev-dependencies list output verbose for snooping on local package.json argument "-dlv"', async () => {
    var {stdout} = await execa('./bin/snoopm.js', ['-dlv']);
    console.log(stdout);
    assertDependencies(stdout, snoopmDevDependencies);
    assert.equal(stdout.indexOf('┌────'), -1, 'should not contain table');
    assert.notEqual(stdout.indexOf(pckg.devDependencies[snoopmDevDependencies[0]].substring(1)), -1, 'should find the dev-dependency version');
  }); 

});

describe('SnOOpm remote', async ()=> {

  it('should retieve default table output for snooping at remote package.json "[url]"', async () => {
    const {stdout} = await execa('./bin/snoopm.js', [pckg.repository.url]);
    assertDependencies(stdout, snoopmDependencies); 
  });
 
  // TODO: this one is failing
  it.only('should retieve dev-dependencies table output for snooping at remote package.json "[url] -d"', async () => {
    const {stdout} = await execa('./bin/snoopm.js', [pckg.repository.url, '-d']);
    assertDependencies(stdout, snoopmDevDependencies); 
  });
 
  it('should retieve list output for snooping at remote package.json "[url] -l"', async () => {
    const {stdout} = await execa('./bin/snoopm.js', [pckg.repository.url, '-l']);
    assert.equal(stdout.indexOf('┌────'), -1, 'should not contain table');
    assertDependencies(stdout, snoopmDependencies); 
  });
 
  // TODO: this one is failing
  it('should retieve dev-dependencies able list output for snooping at remote package.json "[url] -ld"', async () => {
    const {stdout} = await execa('./bin/snoopm.js', [pckg.repository.url, '-ld']);
    assert.equal(stdout.indexOf('┌────'), -1, 'should not contain table');
    assertDependencies(stdout, snoopmDevDependencies); 
  });
 
  it('should retieve default table verbose output for snooping at remote package.json "[url] -v"', async () => {
    const {stdout} = await execa('./bin/snoopm.js', [pckg.repository.url, '-v']);
    assertDependencies(stdout, snoopmDependencies); 
    assert.notEqual(stdout.indexOf(pckg.dependencies[snoopmDependencies[0]].substring(1)), -1, 'should find the dependency version');
  });
 
  // TODO: this one is failing
  it('should retieve dev-dependencies verbose table output for snooping at remote package.json "[url] -dv"', async () => {
    const {stdout} = await execa('./bin/snoopm.js', [pckg.repository.url, '-dv']);
    assertDependencies(stdout, snoopmDevDependencies); 
    assert.notEqual(stdout.indexOf(pckg.devDependencies[snoopmDevDependencies[0]].substring(1)), -1, 'should find the dependency version');
  });
  
  it('should retieve list verbose output for snooping at remote package.json "[url] -vl"', async () => {
    const {stdout} = await execa('./bin/snoopm.js', [pckg.repository.url, '-vl']);
    assertDependencies(stdout, snoopmDependencies); 
    assert.equal(stdout.indexOf('┌────'), -1, 'should not contain table');
    assert.notEqual(stdout.indexOf(pckg.dependencies[snoopmDependencies[0]].substring(1)), -1, 'should find the dependency version');
  });
 
  // TODO: this one is failing
  it('should retieve dev-dependencies verbose table output for snooping at remote package.json "[url] -dlv"', async () => {
    const {stdout} = await execa('./bin/snoopm.js', [pckg.repository.url, '-dlv']);
    assertDependencies(stdout, snoopmDevDependencies); 
    assert.equal(stdout.indexOf('┌────'), -1, 'should not contain table');
    assert.notEqual(stdout.indexOf(pckg.devDependencies[snoopmDevDependencies[0]].substring(1)), -1, 'should find the dependency version');
  });

});

describe('SnOOpm at node_modules', async ()=> {

  it('should retieve default table output for snooping at node_modules package.json "[node_modules_path]"', async () => {
    const {stdout} = await execa('./bin/snoopm.js', [pathPackageNodeModule]);
    assertDependencies(stdout, snoopmDependencies); 
  });
 
  // TODO: this one is failing
  it('should retieve default table output for snooping at node_modules package.json "[node_modules_path]" only with directory', async () => {
    const {stdout} = await execa('./bin/snoopm.js', [pathPackageNodeModuleDir]);
    assertDependencies(stdout, snoopmDependencies); 
  });
 
  it('should retieve default table output for snooping at node_modules package.json "[node_modules_path]" with absolute path', async () => {
    const absolutePathPackageNodeModule = `${process.cwd()}${pathPackageNodeModule.substring(1)}`;
    console.log(absolutePathPackageNodeModule);
    const {stdout} = await execa('./bin/snoopm.js', [absolutePathPackageNodeModule]);
    console.log(stdout);
    assertDependencies(stdout, snoopmDependencies); 
  });
 
  // TODO: this one is failing
  it('should retieve default table output for snooping at node_modules package.json "[node_modules_path]" only with directory and  with absolute path', async () => {
    const absolutePathPackageNodeModuleDir = `${process.cwd()}${pathPackageNodeModuleDir.substring(1)}`;
    const {stdout} = await execa('./bin/snoopm.js', [absolutePathPackageNodeModuleDir]);
    assertDependencies(stdout, snoopmDependencies); 
  });
 
  // TODO: this one is failing
  it('should retieve dev-dependencies table output for snooping at node_modules package.json "[node_modules_path] -d"', async () => {
    const {stdout} = await execa('./bin/snoopm.js', [pathPackageNodeModule, '-d']);
    assertDependencies(stdout, snoopmDevDependencies); 
  });
 
  it('should retieve list output for snooping at node_modules package.json "[node_modules_path] -l"', async () => {
    const {stdout} = await execa('./bin/snoopm.js', [pathPackageNodeModule, '-l']);
    assert.equal(stdout.indexOf('┌────'), -1, 'should not contain table');
    assertDependencies(stdout, snoopmDependencies); 
  });
 
  // TODO: this one is failing
  it('should retieve dev-dependencies table output for snooping at node_modules package.json "[node_modules_path] -d"', async () => {
    const {stdout} = await execa('./bin/snoopm.js', [pathPackageNodeModule, '-ld']);
    assert.equal(stdout.indexOf('┌────'), -1, 'should not contain table');
    assertDependencies(stdout, snoopmDevDependencies); 
  });
 
  it('should retieve default table verbose output for snooping at node_modules package.json "[node_modules_path] -v"', async () => {
    const {stdout} = await execa('./bin/snoopm.js', [pathPackageNodeModule, '-v']);
    assertDependencies(stdout, snoopmDependencies); 
    assert.notEqual(stdout.indexOf(pckg.dependencies[snoopmDependencies[0]].substring(1)), -1, 'should find the dependency version');
  });
 
  // TODO: this one is failing
  it('should retieve dev-dependencies verbose table output for snooping at node_modules package.json "[node_modules_path] -dv"', async () => {
    const {stdout} = await execa('./bin/snoopm.js', [pathPackageNodeModule, '-dv']);
    assertDependencies(stdout, snoopmDevDependencies); 
    assert.notEqual(stdout.indexOf(pckg.devDependencies[snoopmDevDependencies[0]].substring(1)), -1, 'should find the dependency version');
  });
  
  it('should retieve list verbose output for snooping at node_modules package.json "[node_modules_path] -vl"', async () => {
    const {stdout} = await execa('./bin/snoopm.js', [pathPackageNodeModule, '-vl']);
    assertDependencies(stdout, snoopmDependencies); 
    assert.equal(stdout.indexOf('┌────'), -1, 'should not contain table');
    assert.notEqual(stdout.indexOf(pckg.dependencies[snoopmDependencies[0]].substring(1)), -1, 'should find the dependency version');
  });
 
  // TODO: this one is failing
  it('should retieve dev-dependencies verbose table output for snooping at node_modules package.json "[node_modules_path] -dlv"', async () => {
    const {stdout} = await execa('./bin/snoopm.js', [pathPackageNodeModule, '-dlv']);
    assertDependencies(stdout, snoopmDevDependencies); 
    assert.equal(stdout.indexOf('┌────'), -1, 'should not contain table');
    assert.notEqual(stdout.indexOf(pckg.devDependencies[snoopmDevDependencies[0]].substring(1)), -1, 'should find the dependency version');
  });

});
