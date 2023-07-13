import 'dotenv/config';
import axios from 'axios';
import { Command } from 'commander';
import { SharedConfig } from "./constants";
import { RawConfig, Domain } from '@buildwithsygma/sygma-sdk-core';
import { getTransactionInfo } from 'utils';



const program = new Command();

program
    .name("debug-bridge")
    .description("Enables quick debugging of specific Sygma messages (bridging request)")
    .requiredOption(
        "-e, --environment <environment>", "Environment on which to debug"
    ).
    requiredOption(
        "-d, --deposit <depositHash>", "Deposit transaction on which to provide status"
    ).action(async(configs: any) => {
        try {
            const network: keyof typeof SharedConfig = configs.environment; 
            const depositHash: string = configs.depositHash;
            
            const {
                data
            } = await axios.get(SharedConfig[network]) as unknown as { data: RawConfig };

            const networks: Array<Domain> = data.domains.filter((network: Domain) => network.name === "ethereum"); // just evms for now

            await getTransactionInfo(networks, depositHash)
            


        } catch (err) {
            if (err instanceof Error) {
                throw new Error(`Failed to fetch shared config because of: ${err.message}`);
              } else {
                throw new Error('Something went wrong while fetching config file');
              }
        }
    })



program.parse(process.argv)
