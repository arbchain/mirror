const fs = require("fs-extra");
const path = require("path");
const Web3 = require("web3");
const EEAClient = require("web3-besu");
var web3, config, besu;


const initWeb3 = (network) => {
try {

  //Keys
  besu  = require(path.resolve("./", "wallet", "keys.js")).besu;

  
  config = require(path.resolve("./", "mirror-config.js"));

  //Setting the web3 connection
  try {
    const url = config.networks[network].host + (config.networks[network].port ? ':' + config.networks[network].port : '')
    web3 = new EEAClient(new Web3(url), config.networks[network].chainId || 2018);
  }
  catch (error) {
    console.log("Web3 connection error: ", error.message);
  }
}
catch {
  //pass: silent the import errors
}
}

  
var addressPath = path.resolve("./", "build");

// Creating a privacy group

const createPrivacyGroup = async (participants, name, onchain=false, network) => {

  if(onchain) {
    let privacyGroup =await web3.privx.createPrivacyGroup({
      participants: participants,
      enclaveKey: config.networks[network].publicKey,
      privateFrom: config.networks[network].publicKey,
      privateKey: besu[network].privateKey
    });

    return privacyGroup.privacyGroupId

  }
  else {
  return await  web3.priv.createPrivacyGroup({
    addresses: participants,
    name: name,
    description: name
  });
}
}

//Creating a contract object to deploy
const createPrivateContract = (contract, args, privacyGroupId, network) => {

  //Get the ABI
  const ContractAbi = require(path.resolve(addressPath, `${contract}_abi.json`));
  //Get the bytecode
  //creating instance of contract
  new web3.eth.Contract(ContractAbi);

  const binary = require(path.resolve(addressPath, `${contract}_bin.json`)).binary;

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
    from: '0xf17f52151EbEF6C7334FAD080c5704D77216b732',
    data: `0x${binary}${constructorArgs}`,
    privateFrom: config.networks[network].publicKey,
    privacyGroupId,
    privateKey: besu[network].privateKey,
  };
  return web3.eea.sendRawTransaction(contractOptions);
};

//Getting the contract address
const storeTransactionReceipt = async (contract, transactionHash, network) => {

  const transactionReceipt = await web3.priv.getTransactionReceipt(transactionHash, config.networks[network].publicKey);
  console.log("Private transaction Contract Address", transactionReceipt.contractAddress);
  await fs.ensureDirSync(addressPath);
  console.log(`Storing transaction receipt at ${path.resolve(addressPath, `${contract}_receipt` + ".json")}`);
  transactionReceipt["network"] = network
  await fs.writeFileSync(path.resolve(addressPath, `${contract}_receipt` + ".json"), JSON.stringify(transactionReceipt));
};

export const deploy = async (buildPath, privacy, onchain, network) => {

  initWeb3(network)

  console.log("Parsing the migration file");

  const migration = require(path.resolve("./", "migration"));

  //Updating the build path
  addressPath = buildPath;

  try {

    let privacyGroupId = await createPrivacyGroup(migration.groups.public.privacyGroupMembers, "Public contract", onchain, network)

    for (const contract in migration.contracts) {

      //create privacy group if not public deployment
      privacyGroupId = privacy ? await createPrivacyGroup(migration.contracts[contract].privacyGroupMembers, contract, onchain, network) : privacyGroupId

      const buildExists = await fs.existsSync(addressPath + `/${contract}_bin.json`) && await fs.existsSync(addressPath + `/${contract}_abi.json`)
      if (buildExists) {
        const transactionHash = await createPrivateContract(contract, migration.contracts[contract].args, privacyGroupId, network);
        console.log("Private contract deployed with transaction hash: ", transactionHash);
        await storeTransactionReceipt(contract, transactionHash, network);
      } else {
        console.log("Please compile the contracts first!")
        return false
      }
    }

    return true
  }
  catch (err) {

    if(err instanceof Error && err.message.includes("Invalid JSON RPC response")) {
      console.log("RPC connection error, check if the remote node/ service is running.")
    }
    else {
      console.log("Deployment error: ", err)
    }
    return false
  }
};
