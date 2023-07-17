import 'dotenv/config';
import axios from 'axios';
import { Command } from 'commander';
import { SharedConfig } from "./constants";
import { RawConfig, Domain } from '@buildwithsygma/sygma-sdk-core';
import { getTransactionInfo } from './utils';


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
    .action(async(configs: any) => {
        try {
            

        } catch (err) {
            if (err instanceof Error) {
                throw new Error(`Failed to execute because of: ${err.message}`);
              } else {
                throw new Error('Something went wrong');
              }
        }
    })


program.parse(process.argv)

