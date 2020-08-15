---
id: usage
title: Usage
---

### 1. Initiate an empty contract project

Create an empty contract directory and navigate to it and initialize the project
```bash
mirror init
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

The configuration related to the contracts that need to deployed need to be updated in the `migration/index.js` file.
Privacy member details can also be updated for the contract that needs be deployed in a private transaction.

```bash
mirror deploy --private
```

### 4. Test the contracts

Tests written inside the `test` directory will be executed.
```bash
mirror test
```

