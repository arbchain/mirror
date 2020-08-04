# mirror
![Mirror CD](https://github.com/arbchain/mirror/workflows/Mirror%20CD/badge.svg?branch=master)
![Mirror CI](https://github.com/arbchain/mirror/workflows/Mirror%20CI/badge.svg?branch=master)
![version](https://img.shields.io/badge/version-1.1.0beta-blue)
[![docs](https://img.shields.io/badge/docs-0.1.0-green)](https://arbchain.consensolabs.com)
![Contributors](https://img.shields.io/github/contributors/arbchain/mirror)
[![Follow](https://img.shields.io/twitter/follow/consensolabs?style=social&logo=twitter)](https://twitter.com/consensolabs)


Mirror is a compiling, testing and deployment for Hyperledger Besu, aiming to make life as an Enterprise Ethereum developer easier.

## Quick Start

```shell
#Install
$ npm install -g mirror-besu

# Compile 
mirror compile

# Deploy a private contract (Set the privacy members in migration directory)
mirror deploy --private

# Test using MochaJS
mirror test
```
