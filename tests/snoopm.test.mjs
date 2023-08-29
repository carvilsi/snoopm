import { execa } from 'execa';
import { assert } from 'chai';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pckg = require("./../package.json");

const snoopmBin = './bin/snoopm.js';

// TODO: Add is-url dependency to tests after publishing new version
const snoopmDependencies = ['axios','cli-spinner','cli-table','colors','commander','logplease','semver'];
const snoopmDevDependencies = ['chai','mocha','execa'];

const pathPackageNodeModule = './node_modules/snoopm/package.json';
const pathPackageNodeModuleDir = './node_modules/snoopm/';
const urlGitHubPackageNode = 'https://github.com/carvilsi/snoopm/blob/master/package.json';
const urlGitHubRawPackageNode = 'https://raw.githubusercontent.com/carvilsi/snoopm/master/package.json';

function assertDependencies(stdout, dependencies) {
  for (var i = 0; i < dependencies.length; i++) {
    let exists = stdout.indexOf(dependencies[i]);
    assert.notEqual(exists, -1, `${dependencies[i]} snoopm dependency must be at [${dependencies}]`);
  }
}

describe('SnOOpm local', async ()=> {

  it('should retieve version', async () => {
    const {stdout} = await execa(snoopmBin, ['--version']);
    assert.equal(stdout, pckg.version, `version should be ${pckg.version}`);
  });
  
  it('should retieve default table output for snooping on local package.json no arguments', async () => {
    const {stdout} = await execa(snoopmBin);
    // print the output once.
    console.log(stdout);
    // try to assert things like urls and descriptions is not safe, because could change.
    assertDependencies(stdout, snoopmDependencies); 
  });
 
  it('should retieve default table output for snooping on local package.json argument "."', async () => {
    const {stdout} = await execa(snoopmBin, ['.']);
    assertDependencies(stdout, snoopmDependencies);
  });
  
  it('should retieve list output for snooping on local package.json argument "-l"', async () => {
    const {stdout} = await execa(snoopmBin, ['-l']);
    console.log(stdout);
    assert.equal(stdout.indexOf('┌────'), -1, 'should not contain table');
    assertDependencies(stdout, snoopmDependencies);
  });
 
  it('should retieve default table output with dev-dependencies for snooping on local package.json dev-dependencies argument "-d"', async () => {
    const {stdout} = await execa(snoopmBin, ['-d']);
    console.log(stdout);
    assertDependencies(stdout, snoopmDevDependencies); 
  });
 
  it('should retieve default table output with dev-dependencies for snooping on local package.json dev-dependencies argument "-d ."', async () => {
    const {stdout} = await execa(snoopmBin, ['-d', '.']);
    assertDependencies(stdout, snoopmDevDependencies);
  });
  
  it('should retieve list of dev-dependencies output for snooping on local package.json argument "-ld"', async () => {
    const {stdout} = await execa(snoopmBin, ['-ld']);
    console.log(stdout);
    assert.equal(stdout.indexOf('┌────'), -1, 'should not contain table');
    assertDependencies(stdout, snoopmDevDependencies);
  });

  it('should retieve default table output verbose for snooping on local package.json argument "-v"', async () => {
    var {stdout} = await execa(snoopmBin, ['-v']);
    console.log(stdout);
    assertDependencies(stdout, snoopmDependencies);
    assert.notEqual(stdout.indexOf(pckg.dependencies[snoopmDependencies[0]].substring(1)), -1, 'should find the dependency version');
  });

  it('should retieve dev-dependencies table output verbose for snooping on local package.json argument "-dv"', async () => {
    var {stdout} = await execa(snoopmBin, ['-dv']);
    console.log(stdout);
    assertDependencies(stdout, snoopmDevDependencies);
    assert.notEqual(stdout.indexOf(pckg.devDependencies[snoopmDevDependencies[0]].substring(1)), -1, 'should find the dev-dependency version');
  }); 

  it('should retieve list output verbose for snooping on local package.json argument "-lv"', async () => {
    var {stdout} = await execa(snoopmBin, ['-lv']);
    console.log(stdout);
    assertDependencies(stdout, snoopmDependencies);
    assert.equal(stdout.indexOf('┌────'), -1, 'should not contain table');
    assert.notEqual(stdout.indexOf(pckg.dependencies[snoopmDependencies[0]].substring(1)), -1, 'should find the dependency version');
  });
 
  it('should retieve dev-dependencies list output verbose for snooping on local package.json argument "-dlv"', async () => {
    var {stdout} = await execa(snoopmBin, ['-dlv']);
    console.log(stdout);
    assertDependencies(stdout, snoopmDevDependencies);
    assert.equal(stdout.indexOf('┌────'), -1, 'should not contain table');
    assert.notEqual(stdout.indexOf(pckg.devDependencies[snoopmDevDependencies[0]].substring(1)), -1, 'should find the dev-dependency version');
  }); 

});

describe('SnOOpm remote', async ()=> {

  it('should retieve default table output for snooping at remote package.json "[url]"', async () => {
    const {stdout} = await execa(snoopmBin, [pckg.repository.url]);
    assertDependencies(stdout, snoopmDependencies); 
  });
  
  it('should fail if non sense url is provided, e.g "http://lolandthefoobar.baz"', async () => {
    const u = 'http://lolandthefoobar.baz';
    try {
      const {stdout} = await execa(snoopmBin, [u]);
      done(new Error('This test should fail'));
    } catch (error) {
      assert.equal(error.exitCode, 42, 'should fail');
      assert.notEqual(error.stdout.indexOf(`Invalid url provided: ${u}`), -1, 'should print an error');
    }
  });
  
  it('should retieve default table output for snooping at remote package.json complete GitHub url "[url]"', async () => {
    const {stdout} = await execa(snoopmBin, [urlGitHubPackageNode]);
    assertDependencies(stdout, snoopmDependencies); 
  });
 
  it('should retieve default table output for snooping at remote package.json raw GitHub url "[url]"', async () => {
    const {stdout} = await execa(snoopmBin, [urlGitHubRawPackageNode]);
    assertDependencies(stdout, snoopmDependencies); 
  });
 
  it('should retieve dev-dependencies table output for snooping at remote package.json "[url] -d"', async () => {
    const {stdout} = await execa(snoopmBin, [pckg.repository.url, '-d']);
    assertDependencies(stdout, snoopmDevDependencies); 
  });
 
  it('should retieve list output for snooping at remote package.json "[url] -l"', async () => {
    const {stdout} = await execa(snoopmBin, [pckg.repository.url, '-l']);
    assert.equal(stdout.indexOf('┌────'), -1, 'should not contain table');
    assertDependencies(stdout, snoopmDependencies); 
  });
 
  it('should retieve dev-dependencies able list output for snooping at remote package.json "[url] -ld"', async () => {
    const {stdout} = await execa(snoopmBin, [pckg.repository.url, '-ld']);
    assert.equal(stdout.indexOf('┌────'), -1, 'should not contain table');
    assertDependencies(stdout, snoopmDevDependencies); 
  });
 
  it('should retieve default table verbose output for snooping at remote package.json "[url] -v"', async () => {
    const {stdout} = await execa(snoopmBin, [pckg.repository.url, '-v']);
    assertDependencies(stdout, snoopmDependencies); 
    assert.notEqual(stdout.indexOf(pckg.dependencies[snoopmDependencies[0]].substring(1)), -1, 'should find the dependency version');
  });
 
  it('should retieve dev-dependencies verbose table output for snooping at remote package.json "[url] -dv"', async () => {
    const {stdout} = await execa(snoopmBin, [pckg.repository.url, '-dv']);
    assertDependencies(stdout, snoopmDevDependencies); 
    assert.notEqual(stdout.indexOf(pckg.devDependencies[snoopmDevDependencies[0]].substring(1)), -1, 'should find the dependency version');
  });
  
  it('should retieve list verbose output for snooping at remote package.json "[url] -vl"', async () => {
    const {stdout} = await execa(snoopmBin, [pckg.repository.url, '-vl']);
    assertDependencies(stdout, snoopmDependencies); 
    assert.equal(stdout.indexOf('┌────'), -1, 'should not contain table');
    assert.notEqual(stdout.indexOf(pckg.dependencies[snoopmDependencies[0]].substring(1)), -1, 'should find the dependency version');
  });
 
  it('should retieve dev-dependencies verbose table output for snooping at remote package.json "[url] -dlv"', async () => {
    const {stdout} = await execa(snoopmBin, [pckg.repository.url, '-dlv']);
    assertDependencies(stdout, snoopmDevDependencies); 
    assert.equal(stdout.indexOf('┌────'), -1, 'should not contain table');
    assert.notEqual(stdout.indexOf(pckg.devDependencies[snoopmDevDependencies[0]].substring(1)), -1, 'should find the dependency version');
  });

});

describe('SnOOpm at node_modules', async ()=> {

  it('should retieve default table output for snooping at node_modules package.json "[node_modules_path]"', async () => {
    const {stdout} = await execa(snoopmBin, [pathPackageNodeModule]);
    assertDependencies(stdout, snoopmDependencies); 
  });
 
  it('should fail if non sense path is provided, e.g "./node_modules"', async () => {
    const p = './node_modules';
    try {
      const {stdout} = await execa(snoopmBin, [p]);
      done(new Error('This test should fail'));
    } catch (error) {
      assert.equal(error.exitCode, 42, 'should fail');
      assert.notEqual(error.stdout.indexOf(`Invalid provided path for: ${p}`), -1, 'should print an error');
    }
  });
  
  it('should fail if non sense path is provided, e.g "lol"', async () => {
    const p = 'lol';
    try {
      const {stdout} = await execa(snoopmBin, [p]);
      done(new Error('This test should fail'));
    } catch (error) {
      assert.equal(error.exitCode, 42, 'should fail');
      assert.notEqual(error.stdout.indexOf(`Invalid provided path for: ${p}`), -1, 'should print an error');
    }
  });
 
  it('should retieve default table output for snooping at node_modules package.json "[node_modules_path]" with directory', async () => {
    const {stdout} = await execa(snoopmBin, [pathPackageNodeModuleDir]);
    assertDependencies(stdout, snoopmDependencies); 
  });
 
  it('should retieve default table output for snooping at node_modules package.json "[node_modules_path]" with absolute path', async () => {
    const absolutePathPackageNodeModule = `${process.cwd()}${pathPackageNodeModule.substring(1)}`;
    const {stdout} = await execa(snoopmBin, [absolutePathPackageNodeModule]);
    assertDependencies(stdout, snoopmDependencies); 
  });
  
  it('should retieve default table output for snooping at node_modules package.json "[node_modules_path]" without ./', async () => {
    const noDotPathPackageNodeModule = pathPackageNodeModule.substring(2);
    const {stdout} = await execa(snoopmBin, [noDotPathPackageNodeModule
    ]);
    assertDependencies(stdout, snoopmDependencies); 
  });

  it('should retieve default table output for snooping at node_modules package.json "[node_modules_path]" with directory and with absolute path', async () => {
    const absolutePathPackageNodeModuleDir = `${process.cwd()}${pathPackageNodeModuleDir.substring(1)}`;
    const {stdout} = await execa(snoopmBin, [absolutePathPackageNodeModuleDir]);
    assertDependencies(stdout, snoopmDependencies); 
  });
 
  it('should retieve default table output for snooping at node_modules package.json "[node_modules_path]" with directory and without ./', async () => {
    const noDotPathPackageNodeModuleDir = pathPackageNodeModuleDir.substring(2);
    const {stdout} = await execa(snoopmBin, [noDotPathPackageNodeModuleDir]);
    assertDependencies(stdout, snoopmDependencies); 
  });

  it('should retieve dev-dependencies table output for snooping at node_modules package.json "[node_modules_path] -d"', async () => {
    const {stdout} = await execa(snoopmBin, [pathPackageNodeModule, '-d']);
    assertDependencies(stdout, snoopmDevDependencies); 
  });
 
  it('should retieve list output for snooping at node_modules package.json "[node_modules_path] -l"', async () => {
    const {stdout} = await execa(snoopmBin, [pathPackageNodeModule, '-l']);
    assert.equal(stdout.indexOf('┌────'), -1, 'should not contain table');
    assertDependencies(stdout, snoopmDependencies); 
  });
 
  it('should retieve dev-dependencies table output for snooping at node_modules package.json "[node_modules_path] -d"', async () => {
    const {stdout} = await execa(snoopmBin, [pathPackageNodeModule, '-ld']);
    assert.equal(stdout.indexOf('┌────'), -1, 'should not contain table');
    assertDependencies(stdout, snoopmDevDependencies); 
  });
 
  it('should retieve default table verbose output for snooping at node_modules package.json "[node_modules_path] -v"', async () => {
    const {stdout} = await execa(snoopmBin, [pathPackageNodeModule, '-v']);
    assertDependencies(stdout, snoopmDependencies); 
    assert.notEqual(stdout.indexOf(pckg.dependencies[snoopmDependencies[0]].substring(1)), -1, 'should find the dependency version');
  });
 
  it('should retieve dev-dependencies verbose table output for snooping at node_modules package.json "[node_modules_path] -dv"', async () => {
    const {stdout} = await execa(snoopmBin, [pathPackageNodeModule, '-dv']);
    assertDependencies(stdout, snoopmDevDependencies); 
    assert.notEqual(stdout.indexOf(pckg.devDependencies[snoopmDevDependencies[0]].substring(1)), -1, 'should find the dependency version');
  });
  
  it('should retieve list verbose output for snooping at node_modules package.json "[node_modules_path] -vl"', async () => {
    const {stdout} = await execa(snoopmBin, [pathPackageNodeModule, '-vl']);
    assertDependencies(stdout, snoopmDependencies); 
    assert.equal(stdout.indexOf('┌────'), -1, 'should not contain table');
    assert.notEqual(stdout.indexOf(pckg.dependencies[snoopmDependencies[0]].substring(1)), -1, 'should find the dependency version');
  });
 
  it('should retieve dev-dependencies verbose table output for snooping at node_modules package.json "[node_modules_path] -dlv"', async () => {
    const {stdout} = await execa(snoopmBin, [pathPackageNodeModule, '-dlv']);
    assertDependencies(stdout, snoopmDevDependencies); 
    assert.equal(stdout.indexOf('┌────'), -1, 'should not contain table');
    assert.notEqual(stdout.indexOf(pckg.devDependencies[snoopmDevDependencies[0]].substring(1)), -1, 'should find the dependency version');
  });
});
