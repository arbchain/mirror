const fs = require("fs-extra");
const path = require("path");
const Web3 = require("web3");
const EEAClient = require("web3-eea");

//Keys
const { orion, besu } = require(path.resolve("./", "wallet", "keys.js"));
const migration = require(path.resolve("./", "migration"));
const config = require(path.resolve("./", "mirror-config.js"));

//Setting the web3 connection
try {
  var web3 = new EEAClient(new Web3(`${config.networks.development.host}:${config.networks.development.port}`), 2018);
}
catch (error) {
  console.log("Web3 connection error: ", error.message);
}
var addressPath = path.resolve("./", "build");

//Creating a contract object to deploy
const createPrivateContract = (contract) => {

  //Get the ABI
  const ContractAbi = require(path.resolve("./", `./build/${contract}.json`));
  //Get the bytecode
  //creating instance of contract
  new web3.eth.Contract(ContractAbi);

  const binary = fs.readFileSync(path.resolve("./", `./build/${contract}.bin`));

  //Step 1: Check for the constructor if available
  const functionAbi = ContractAbi.find((e) => {
    return e.type === "constructor";
  });

  //Create the transaction object
  const contractOptions = {
    data: `0x${binary}`,
    privateFrom: orion.node1.publicKey,
    privateFor: [orion.node2.publicKey],
    privateKey: besu.node1.privateKey,
  };
  return web3.eea.sendRawTransaction(contractOptions);
};

//Getting the contract address
const storeTransactionReceipt = async (contract, transactionHash) => {

  const transactionReceipt = await web3.priv.getTransactionReceipt(transactionHash, orion.node1.publicKey);
  console.log("Private transaction Contract Address", transactionReceipt.contractAddress);
  await fs.ensureDirSync(addressPath);
  fs.writeFile(path.resolve(addressPath, `${contract}_receipt` + ".json"), JSON.stringify(transactionReceipt), (err) => {
    console.log(`Storing transaction receipt at ${path.resolve(addressPath, `${contract}_receipt` + ".json")}`);
    if (err) throw err;
  });
};

export const deploy = async (buildPath) => {

  console.log("Parsing the migration file");

  //Updating the build path
  addressPath = buildPath;

  for (const contract in migration) {
    if(!migration[contract].length) {
      const buildExists = await fs.existsSync(addressPath + `/${contract}.bin`) && await fs.existsSync(addressPath + `/${contract}.json`)
      if(buildExists) {
        const transactionHash = await createPrivateContract(contract);
        console.log("Private contract deployed with transaction hash: ", transactionHash);
        await storeTransactionReceipt(contract, transactionHash);
      }
    else {
      console.log("Please compile the contracts first!")
      }
    }
  }
};
