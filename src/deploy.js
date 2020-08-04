const fs = require("fs-extra");
const path = require("path");
const Web3 = require("web3");
const EEAClient = require("web3-besu");

try {

//Keys
  var {orion, besu} = require(path.resolve("./", "wallet", "keys.js"));
  const config = require(path.resolve("./", "mirror-config.js"));

  //Setting the web3 connection
  try {
    var web3 = new EEAClient(new Web3(`${config.networks.node1.host}:${config.networks.node1.port}`), 2018);
  }
  catch (error) {
    console.log("Web3 connection error: ", error.message);
  }
}
catch {
  //pass: silent the import errors
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
const createPrivateContract = (contract, args, privacyGroupId) => {

  //Get the ABI
  const ContractAbi = require(path.resolve(addressPath, `${contract}.json`));
  //Get the bytecode
  //creating instance of contract
  new web3.eth.Contract(ContractAbi);

  const binary = fs.readFileSync(path.resolve(addressPath, `${contract}.bin`));

    //Step 1: Check for the constructor if available
    const constructorAbi = ContractAbi.find((e) => {
      return e.type === "constructor";
    });


  let constructorArgs = ''
  if(constructorAbi && args.length) {
      constructorArgs = web3.eth.abi
        .encodeParameters(constructorAbi.inputs, args)
        .slice(2);
  }


  //Create the transaction object
  const contractOptions = {
    data: `0x${binary}${constructorArgs}`,
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
  console.log(`Storing transaction receipt at ${path.resolve(addressPath, `${contract}_receipt` + ".json")}`);
  await fs.writeFileSync(path.resolve(addressPath, `${contract}_receipt` + ".json"), JSON.stringify(transactionReceipt));
};

export const deploy = async (buildPath, privacy) => {

  console.log("Parsing the migration file");

  const migration = require(path.resolve("./", "migration"));

  //Updating the build path
  addressPath = buildPath;

  try {

    let privacyGroup = await createPrivacyGroup(migration.groups.public.privacyGroupMembers)

    for (const contract in migration.contracts) {

      //create privacy group if not public deployment
      privacyGroup = privacy ? await createPrivacyGroup(migration.contracts[contract].privacyGroupMembers) : privacyGroup
      let privacyGroupId = privacyGroup.privacyGroupId

      const buildExists = await fs.existsSync(addressPath + `/${contract}.bin`) && await fs.existsSync(addressPath + `/${contract}.json`)
      if (buildExists) {
        const transactionHash = await createPrivateContract(contract, migration.contracts[contract].args, privacyGroupId);
        console.log("Private contract deployed with transaction hash: ", transactionHash);
        await storeTransactionReceipt(contract, transactionHash);
      } else {
        console.log("Please compile the contracts first!")
      }
    }
  }
  catch (err) {

    if(err instanceof Error && err.message.includes("Invalid JSON RPC response")) {
      console.log("RPC connection error, check if the remote node/ service is running.")
    }
    else {
      console.log("Deployment error: ", err)
    }

  }
};
