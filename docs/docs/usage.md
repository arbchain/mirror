---
id: usage
title: Usage
---

### 1. Initiate an empty contract project

Create an empty contract directory and navigate to it and initialize the project
```bash
mirror init
```

The init command executed on an empty directory will create a basic project structure as below:

```
├── contract
│   ├── SomeContract.sol
├── migration
│   ├── index.js
├── wallet
│   ├── keys.js
├── test
│   ├── SomeContract.test.js
├── mirror-config.js
```


Once the project is initialized, install the dependencies

```
npm install
```

### 2. Compile the contract project

All the solidity contracts inside the `contract` directory will be compiled and corresponding  **ABI** and binary files will be 
stored in the `build` directory.
```bash
mirror compile
```

### 3. Deploy a private contract 

The configuration related to the contracts that need to deployed is maintained in the `migration/index.js` file.
This operation also requires the node information to be maintained at `mirror-congig.js` so that it can communicate with all the nodes on which the contract needs to be deployed.

You can deploy the contract once all the configuration is updated.

```bash
mirror deploy --private
```

The deployment is where the mirror tool is very handy as it supports all the privacy concepts on Hypeledger Besu.
It supports both onchain and off chain privacy groups of Orion nodes while performing the contract deployment. Refer the [network configuration](./configurations) for more details on this.

### 4. Test the contracts

Tests written inside the `test` directory will be executed.
```bash
mirror test
```

