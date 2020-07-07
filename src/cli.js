import arg from 'arg';
const fs = require('fs');
import inquirer from 'inquirer';
const Mocha = require('mocha');
const path = require("path");

import {compile} from './compile.js';
import {deploy} from './deploy.js';
const config = require(path.resolve("./", "mirror-config.js"));

function parseArgumentsIntoOptions(rawArgs) {
 const args = arg(
     {
      '--private': Boolean,
      '--dir': String,
      '--testDir': String,
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
   choices: ['compile', 'deploy', 'test'],
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
 if (options.action === 'compile') {
  compile(options.dir, config.contracts_build_directory);
 }
 else if (options.action === 'deploy') {
  // compile(options.dir);
  await deploy(config.contracts_build_directory, options.private);
 }
 else if (options.action === 'test') {

  // compile(options.dir);
  await deploy(config.contracts_build_directory, options.private);

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
