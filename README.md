# maintenance-utils
NodeCLI for various purposes

## Commands

```pause``` - Pause all transfers across all bridges on selected enviroment (devnet, testnet or mainnet)

Run with: ``` node pause -pk "private-key" -m "mnemonic words" -e "environment" ```

```top-up-relayers``` - Top up relayers with their native currency on selected environment (devnet, testnet or mainnet)

Run with: ``` node top-up-relayers -e "environment" ```

[OPTIONAL FLAG] --check-only (does not top up but print out balances of all relayers)
