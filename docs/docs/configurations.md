---
id: configurations
title: Network configurations
---

There are two configuration files that you need to pay attention to while deploying the contract.

* Mirror configuration file (`mirror-config.js`)
* Deployment configuration file (`migration/index.js`)



### Mirror configuration

The `mirror-config.js` file is similar to the `truffle-config.js` maintained for the Truffle tool. Just like the
truffle, mirror too needs the network and compilation details when the contract is being deployed. Node url, port, public key and chain Id can be maintained here. You can also maintain multiple node information here and point the mirror to the node while deploying.

```
networks: {

    node1: {
      host: 'http://testnet.besu.consensolabs.com',
      port: 20000,
      publicKey: "A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo=",
      chainId: 2018,
      group: 1
    }
}
```

As you can see in the above configuration, there is also a `group` key for the node. This is later used in the deployment to identify all the nodes on the same group.

You can tell the mirror about the node with `network` flag:

```bash
mirror deploy --network node1
```

### Deployment configuration

The configuration related to the contracts that needs to be deployed is maintained in the `migration/index.js` file. All the contract that needs to be deployed need to be mentioned here. If the contract has to be deployed 
on a few nodes, all the node public keys has to be passed. If no private nodes are passed, it will be deployed 
on all the nodes mentioned in the `mirrir-config.js` that mathches the group id mentioned in the migration configuration file.

```
module.exports = {
    contracts: {
        Counter: {args: [0], privacyGroupMembers: [networks.node1.publicKey, networks.node3.publicKey]},
    },
    groups: {
        public: {privacyGroupMembers: PUBLIC_NODES},
    }

};
```

The `private` flag will deploy on all the nodes mentioned for each contract.

```bash
mirror deploy --private
```

#### Privacy group deployments

When deploying the contract, there will be scenarios for you to deploy the contract on a set of nodes.
In Hyperledger Besu privacy nodes, this can be achived with privacy groups (onchain or off chain).

If you are deploying on privacy nodes that support onchain privacy group, you need to add an `onchain-privacy` flog.

```bash
mirror deploy --onchain-privacy
```

 The mirror will try to create a offchain privacy group if nothing is specified.


