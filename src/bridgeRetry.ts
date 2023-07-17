import 'dotenv/config';
import axios from 'axios';
import { Command } from 'commander';
import { SharedConfig } from "./constants";
import { RawConfig, Domain } from '@buildwithsygma/sygma-sdk-core';
import { retryTransaction } from './utils';


const program = new Command();

program
    .name("retry")
    .description("Retries a failed transaction on a bridge")
    .requiredOption(
        "-e, --environment <environment>", "Environment on which to retry a transaction"
    )
    .requiredOption(
        "-txn, --transaction-hash <transactionHash>", "Transaction which to retry"
    )
    .requiredOption(
        "-cid, --chain-id <chainId>", "Chain on which to retry the transaction"
    )
    .requiredOption(
        "-pk, --private-key <privateKey>', 'Private key to use for signing transactions"
    )
    .action(async(configs: any) => {
        try {
            const network: keyof typeof SharedConfig = configs.environment; 
            const {
                data
            } = await axios.get(SharedConfig[network]) as unknown as { data: RawConfig };
            
            const networks = data.domains.filter((domain: Domain) => 
                domain.name === "ethereum" 
                && domain.chainId == configs.chainId)
            if (!networks){
                throw new Error("Chain doesn't exist")
            }

            await retryTransaction(networks[0], configs.transactionHash, configs.privateKey)

        } catch (err) {
            if (err instanceof Error) {
                throw new Error(`Failed to execute because of: ${err.message}`);
              } else {
                throw new Error('Something went wrong');
              }
        }
    })


program.parse(process.argv)

