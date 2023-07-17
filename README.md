# maintenance-utils
NodeCLI for various purposes

## Commands

```pause``` - Pause all transfers across all bridges on selected enviroment (devnet, testnet or mainnet)

```debug``` - Provide information about transactions for a specific Sygma message

```retry``` - Retries a failed transaction by calling function ```retry(string memory txHash)``` on bridge contract

Run with:

```
node pause -pk "private-key" -m "mnemonic words" -e "environment"
```
```
node debug -e "environment" -txn "transaction hash" -cid "chain id" 
```
```
node retry -e "environment" -txn "transaction hash" -cid "chain id" -pk "private key"
```