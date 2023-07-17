# maintenance-utils
NodeCLI for various purposes

## Commands

```pause``` - Pause all transfers across all bridges on selected enviroment (devnet, testnet or mainnet)

```debug``` - Provide information about transactions for a specific Sygma message

Run with:

```
node pause -pk "private-key" -m "mnemonic words" -e "environment"
```
```
node debug -e "environment" -d "deposit hash" -cid "chain id" 
```