const path = require("path");
const fs = require("fs-extra");
const solc = require("solc");

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

  function findImports() {
      return {
        contents:
            fs.readFileSync(importFiles[0]).toString()
      };
  }

  let compiledCode;
  if (importFiles.length > 0) {

    compiledCode = JSON.parse(solc.compile(JSON.stringify(input), {import: findImports}));
  }
  else
    {
      compiledCode = JSON.parse(solc.compile(JSON.stringify(input)));
    }

  fs.ensureDirSync(buildPath);
  //outputing .bin

  for (let contractName in compiledCode.contracts[fileToCompile]) {
    const contractByteCode = compiledCode.contracts[fileToCompile][contractName].evm.bytecode.object;
    fs.writeFile(path.resolve(buildPath, contractName + ".bin"), contractByteCode, (err) => {
      console.log(`Writing ByteCode to: ${path.resolve(buildPath, contractName + ".bin")}`);
      if (err) throw err;
    });

    const contractABI = JSON.stringify(compiledCode.contracts[fileToCompile][contractName].abi);
    fs.writeFile(path.resolve(buildPath, contractName + ".json"), contractABI, (err) => {
      console.log(`Writing ABI to: ${path.resolve(buildPath, contractName + ".json")} `);
      //     In case of a error throw err.
      if (err) throw err;
    });
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
  solidityFiles.forEach((file) => compileFile(buildPath, dirPath, file));
}