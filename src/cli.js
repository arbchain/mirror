import arg from 'arg';
const fs = require('fs');
import inquirer from 'inquirer';
const Mocha = require('mocha');
const path = require("path");
const logSymbols = require('log-symbols');
const execa = require('execa');

import {compile} from './compile.js';
import {deploy} from './deploy.js';

let buildDir = ''
try {
  buildDir = require(path.resolve("./", "mirror-config.js")).contracts_build_directory;
}
catch(err) {
 //pass: silent the import errors
}
function parseArgumentsIntoOptions(rawArgs) {
 const args = arg(
     {
      '--private': Boolean,
      '--dir': String,
      '--testDir': String,
      '--buildPath': String,
      '--yes': Boolean,
      '-p': '--private',
      '-y': '--yes',
     },
     {
      argv: rawArgs.slice(2),
     }
 );
 return {
  skipPrompts: args['--yes'] || false,
  private: args['--private'] || false,
  dir: args['--dir'] || 'contract',
  testDir: args['--testDir'] || 'test',
  buildPath: args['--buildPath'] || buildDir,
  action: args._[0],
 };
}

async function promptForMissingOptions(options) {
 const defaultAction = 'compile';
 if (options.skipPrompts) {
  return {
   ...options,
   action: options.action || defaultAction,
  };
 }

 const questions = [];
 if (!options.action) {
  questions.push({
   type: 'list',
   name: 'action',
   message: 'Please choose an operation',
   choices: ['init', 'compile', 'deploy', 'test'],
   default: defaultAction,
  });
 }

 if (!options.private && (options.action === 'deploy')) {
  questions.push({
   type: 'private',
   name: 'private',
   message: 'Deploy contract as public?',
   default: true,
  });
 }

 const answers = await inquirer.prompt(questions);
 return {
  ...options,
  action: options.action || answers.action,
  private: options.private || ! answers.private,
 };
}

export async function cli(args) {

  let options = parseArgumentsIntoOptions(args);
  options = await promptForMissingOptions(options);

  function compileContract() {
   if(compile(options.dir, options.buildPath)) {
    console.log(logSymbols.success, 'Compilation successful!\n');
   }
   else {
    console.log(logSymbols.warning, 'Some compilation failed!\n');
   }
  }

  async function deployContract() {
   if(await deploy(options.buildPath, options.private)) {
    console.log(logSymbols.success, 'Deployment successful!\n');
   }
   else {
    console.log(logSymbols.error, 'Deployment failed!\n');
   }
  }

 if (options.action === 'init') {
  try {
   const {stdout} = await execa('git', ['clone', 'https://github.com/arbchain/besu-contracts-boilerplate', '.'])
  }
  catch(err) {
   console.log(logSymbols.warning, 'Make sure run init command in an empty directory')
   return
  }
  console.log(logSymbols.success, 'Project initialised!\n');
  console.log('What next?\n 1. Install dependencies (npm install) \n 2. Test the project (mirror test)');
 }
 else if (options.action === 'compile') {
  compileContract()
 }
 else if (options.action === 'deploy') {
  compileContract()
  await deployContract()
 }
 else if (options.action === 'test') {

  compileContract()
  await deployContract()

  let mocha = new Mocha();
  mocha.timeout(15000);
  // Add each .js file to the mocha instance
  fs.readdirSync(options.testDir).filter(function(file) {
   // Only keep the .js files
   return file.substr(-3) === '.js';

  }).forEach(function(file) {
   mocha.addFile(
       path.join(options.testDir, file)
   );
  });

  // Run the tests.
  mocha.run(function(failures) {
   process.exitCode = failures ? 1 : 0;  // exit with non-zero status if there were failures
  });

 }
}
