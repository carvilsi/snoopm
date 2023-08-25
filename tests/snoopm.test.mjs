import {execa} from 'execa';
import {assert} from 'chai';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pckg = require("./../package.json");

const snoopmDependencies = ['axios','cli-spinner','cli-table','colors','commander','logplease','semver'];
const snoopmDevDependencies = ['chai','mocha','execa'];

function assertDependencies(stdout, dependencies) {
  for (var i = 0; i < dependencies.length; i++) {
    let exists = stdout.indexOf(dependencies[i]);
    assert.notEqual(exists, -1, `${dependencies[i]} snoopm dependency must be at [${dependencies}]`);
  }
}

describe('SnOOpm command line', async ()=>{

  it('should retieve version', async () =>{
    const {stdout} = await execa('./bin/snoopm.js', ['--version']);
    assert.equal(stdout, pckg.version, `version should be ${pckg.version}`);
  });
  
  it('should retieve default table output for snooping on local package.json no arguments', async () =>{
    const {stdout} = await execa('./bin/snoopm.js');
    // only print the output once.
    console.log(stdout);
    // try to assert things like urls and descriptions is not safe, because could change.
    assertDependencies(stdout, snoopmDependencies); 
  });
 
  it('should retieve default table output for snooping on local package.json argument "."', async () =>{
    const {stdout} = await execa('./bin/snoopm.js', ['.']);
    assertDependencies(stdout, snoopmDependencies);
  });
  
  it('should retieve list output for snooping on local package.json argument "-l"', async () =>{
    const {stdout} = await execa('./bin/snoopm.js', ['-l']);
    console.log(stdout);
    assert.equal(stdout.indexOf('┌────'), -1, 'should not contain table');
    assertDependencies(stdout, snoopmDependencies);
  });
 
  it('should retieve default table output with dev-dependencies for snooping on local package.json dev-dependencies argument "-d"', async () =>{
    const {stdout} = await execa('./bin/snoopm.js', ['-d']);
    console.log(stdout);
    assertDependencies(stdout, snoopmDevDependencies); 
  });
 
  it('should retieve default table output with dev-dependencies for snooping on local package.json dev-dependencies argument "-d ."', async () =>{
    const {stdout} = await execa('./bin/snoopm.js', ['-d', '.']);
    assertDependencies(stdout, snoopmDevDependencies);
  });
  
  it('should retieve list of dev-dependencies output for snooping on local package.json argument "-ld"', async () =>{
    const {stdout} = await execa('./bin/snoopm.js', ['-ld']);
    console.log(stdout);
    assert.equal(stdout.indexOf('┌────'), -1, 'should not contain table');
    assertDependencies(stdout, snoopmDevDependencies);
  });

it.only('should retieve default table output verbose for snooping on local package.json argument "-v"', async () =>{
    var {stdout} = await execa('./bin/snoopm.js', ['-v']);
    console.log(stdout);
    assert.notEqual(stdout.indexOf(pckg.dependencies[snoopmDependencies[0]].substring(1)), -1, 'should find the dependency version');
  });
  
});
