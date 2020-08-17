const path = require("path");
const fs = require("fs-extra");
const solc = require("solc");
const logSymbols = require('log-symbols');
const {findImports} = require('./import-utils');

function compileFile(buildPath, dir, file) {
  const fileToCompile = path.join(dir, file);

  console.log("Compiling contract:", fileToCompile);
  //get the source code
  let source = fs.readFileSync(fileToCompile).toString();
  let imports = source.match(/import.*/g);
  let importFiles = [];
  if(imports) {
    for (file of imports) {
     importFiles.push(path.resolve(dir, file.match(/('|").*('|")/g)[0].slice(1,-1)))
    }
  }

  //Setting the options for Solc compiler
  let input = {
    language: "Solidity",
    sources: {
      [fileToCompile]: {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["*"],
        },
      },
    },
  };

  /*
  Outdated import logic
  function findImports() {
      return {
        contents:
            fs.readFileSync(importFiles[0]).toString()
      };
  }
  */

  let compiledCode;
  if (importFiles.length > 0) {

      compiledCode = JSON.parse(solc.compile(JSON.stringify(input), {import: findImports(dir) }));
      if(compiledCode.errors)
      {
        console.log(compiledCode.errors)
        if(compiledCode.errors.filter(error => error.severity === 'error').length) {
          return false;
        }
      }
  }
  else
    {
        compiledCode = JSON.parse(solc.compile(JSON.stringify(input)));
        if(compiledCode.errors)
        {
          console.log(compiledCode.errors)
          if(compiledCode.errors.severity === 'error') {
            return false;
          }
        }
    }

  fs.ensureDirSync(buildPath);
  //outputing .bin

  for (let contractName in compiledCode.contracts[fileToCompile]) {
    const contractByteCode = compiledCode.contracts[fileToCompile][contractName].evm.bytecode.object;
    fs.writeFileSync(path.resolve(buildPath, contractName + ".bin"), contractByteCode)
    console.log(`Writing ByteCode to: ${path.resolve(buildPath, contractName + ".bin")}`);


    const contractABI = JSON.stringify(compiledCode.contracts[fileToCompile][contractName].abi);
    fs.writeFileSync(path.resolve(buildPath, contractName + ".json"), contractABI)
    console.log(`Writing ABI to: ${path.resolve(buildPath, contractName + ".json")} `)

  }
}


export function compile(dirPath, buildPath) {
  console.log(`Parsing the directory ${dirPath}`);

  // Updating build path
  buildPath = buildPath
  let solidityFiles = [];
  fs.readdirSync(dirPath).forEach((file) => {
    if (file.match(/.*.sol$/)) {
      solidityFiles.push(file);
    }
  });
  const errorFiles = solidityFiles.filter((file) => compileFile(buildPath, dirPath, file)===false)
  if (errorFiles.length) {
    console.log('\n Failed to compile: ')
    errorFiles.forEach(error => console.log(logSymbols.error, error))

    return false
  }

  return true
}
