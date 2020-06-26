const path = require("path");
const fs = require("fs-extra");
const solc = require("solc");

function compileFile(dir, file) {
  const fileToCompile = path.join(dir, file);
  const buildPath = path.resolve(__dirname, "../build");
  fs.removeSync(buildPath);
  console.log("Compiling contract:", fileToCompile);
  //get the source code
  let source = fs.readFileSync(fileToCompile).toString();

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

  let compiledCode = JSON.parse(solc.compile(JSON.stringify(input)));

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


export function compile(dirPath) {
  console.log(`Parsing the directory ${dirPath}`);
  let solidityFiles = [];
  fs.readdirSync(dirPath).forEach((file) => {
    if (file.match(/.*.sol$/)) {
      solidityFiles.push(file);
    }
  });
  solidityFiles.forEach((file) => compileFile(dirPath, file));
}
