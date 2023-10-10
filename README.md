# maintenance-utils CLI

A CLI for maintenance-utils.

## How to run the maintenance-utils CLI

* run `yarn install` - to install all dependecies
* populate `rpcEndpoints.json` with your supported networks
* run `yarn build` - to update execution file
* run `./bin/maintenance-utils <command> <subcommand>`  - to execute a command

## Commands

`bridge pause` - pauses all bridge instances across the selected network
`bridge unpause` - unpauses all bridge instances across the selected network
`bridge retry` - retries a failed transaction
`relayer top-up` - tops upp all relayers balances that are under the `nativeTokenMinBalance`, the top amount can be adjusted with `RELAYER_TOP_UP_MULTIPLIER` env variable
