import arg from 'arg';
import inquirer from 'inquirer';
const path = require("path");

import {compile} from './compile.js';
import {deploy} from './deploy.js';
const config = require(path.resolve("./", "mirror-config.js"));

function parseArgumentsIntoOptions(rawArgs) {
 const args = arg(
     {
      '--private': Boolean,
      '--dir': String,
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
  template: args._[0],
 };
}

async function promptForMissingOptions(options) {
 const defaultTemplate = 'compile';
 if (options.skipPrompts) {
  return {
   ...options,
   template: options.template || defaultTemplate,
  };
 }

 const questions = [];
 if (!options.template) {
  questions.push({
   type: 'list',
   name: 'template',
   message: 'Please choose an operation',
   choices: ['compile', 'deploy'],
   default: defaultTemplate,
  });
 }

 if (!options.private && (options.template === 'deploy')) {
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
  template: options.template || answers.template,
  private: options.private || ! answers.private,
 };
}

export async function cli(args) {
 let options = parseArgumentsIntoOptions(args);
 options = await promptForMissingOptions(options);
 if (options.template === 'compile') {
  compile(options.dir, config.contracts_build_directory);
 }
 else if (options.template === 'deploy') {
  // compile(options.dir);
  await deploy(config.contracts_build_directory);
 }
}
