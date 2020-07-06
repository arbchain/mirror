const fs = require("fs-extra");
const path = require("path");
const Web3 = require("web3");
const EEAClient = require("web3-besu");

//Keys
const { orion, besu } = require(path.resolve("./", "wallet", "keys.js"));
const migration = require(path.resolve("./", "migration"));
const config = require(path.resolve("./", "mirror-config.js"));

//Setting the web3 connection
try {
  var web3 = new EEAClient(new Web3(`${config.networks.node1.host}:${config.networks.node1.port}`), 2018);
}
catch (error) {
  console.log("Web3 connection error: ", error.message);
}
var addressPath = path.resolve("./", "build");

// Creating a privacy group

const createPrivacyGroup = async (participants) => {

  return await web3.privx.createPrivacyGroup({
    participants: participants,
    enclaveKey: orion.node1.publicKey,
    privateFrom: orion.node1.publicKey,
    privateKey: besu.node1.privateKey
  });
}

//Creating a contract object to deploy
const createPrivateContract = (contract, privacyGroupId) => {

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
    privacyGroupId,
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

export const deploy = async (buildPath, privacy) => {

  console.log("Parsing the migration file");

  //Updating the build path
  addressPath = buildPath;


  let privacyGroup = await createPrivacyGroup(migration.groups.public.privacyGroupMembers)

  for (const contract in migration.contracts) {

    //create privacy group if not public deployment
    privacyGroup = privacy ? await createPrivacyGroup(migration.contracts[contract].privacyGroupMembers) : privacyGroup
    let privacyGroupId = privacyGroup.privacyGroupId

    if(!migration.contracts[contract].args.length) {
      const buildExists = await fs.existsSync(addressPath + `/${contract}.bin`) && await fs.existsSync(addressPath + `/${contract}.json`)
      if(buildExists) {
        const transactionHash = await createPrivateContract(contract, privacyGroupId);
        console.log("Private contract deployed with transaction hash: ", transactionHash);
        await storeTransactionReceipt(contract, transactionHash);
      }
    else {
      console.log("Please compile the contracts first!")
      }
    }
  }
};
