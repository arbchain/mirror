# mirror
![Mirror CD](https://github.com/arbchain/mirror/workflows/Mirror%20CD/badge.svg?branch=master)
![Mirror CI](https://github.com/arbchain/mirror/workflows/Mirror%20CI/badge.svg?branch=master)
![version](https://img.shields.io/badge/version-1.1.0beta-blue)
[![docs](https://img.shields.io/badge/docs-0.1.0-green)](https://docs.mirror.consensolabs.com)
![Contributors](https://img.shields.io/github/contributors/arbchain/mirror)
[![Follow](https://img.shields.io/twitter/follow/consensolabs?style=social&logo=twitter)](https://twitter.com/consensolabs)


Mirror is a compiling, testing and deployment for Hyperledger Besu, aiming to make life as an Enterprise Ethereum developer easier.

Detailed documentation can be found [here](https://docs.mirror.consensolabs.com).

## Quick Start

```shell

# Install
$ npm install -g mirror-besu

# Initialize
mirror init

# Compile 
mirror compile

# Deploy a private contract (Set the privacy members in migration directory)
mirror deploy --private

# Deploy a private contract on a specific network specified in mirror-config.js
mirror deploy --private --network node1

# Deploy a private contract on besu network that has onchain privacy group configured
mirror test --private --onchain-privacy

# Test using MochaJS
mirror test
```
