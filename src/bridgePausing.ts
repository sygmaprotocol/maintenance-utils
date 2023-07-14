import 'dotenv/config';
import axios from 'axios';
import { Command, Option } from 'commander';
import { Wallet } from 'ethers';
import { SharedConfig } from "./constants";
import { getWalletsForDifferentProviders, deriveWalletsFromMnemonic, sendPauseTransactions } from "./utils";
import { RawConfig, Domain } from '@buildwithsygma/sygma-sdk-core';

const program = new Command();

program
  .name("pause-bridge")
  .description("Pauses all bridge instances across all networks")
  .version("0.0.1")

program
  .command("pause")
  .addOption(
    new Option('-e, --environment <environment>', 'Environment on which to pause bridge instances')
      .choices(['devnet', 'testnet', 'mainnet'])
  )
  .addOption(
    new Option('-pk, --private-key <privateKey>', 'Private key to use for signing transactions')
  )
  .addOption(
    new Option('-m, --mnemonic <mnemonic>', 'Mnemonic to use for signing transactions').conflicts('private-key')
  )
  .action(async (configs: any) => {
    try {
      const network: keyof typeof SharedConfig = configs.environment;
      const {
        privateKey,
        mnemonic
      } = configs;

      const {
        data
      } = await axios.get(SharedConfig[network]) as unknown as { data: RawConfig };

      const networks: Array<Domain> = data.domains.filter((network: Domain) => network.name === "ethereum"); // just evms for now

      let wallets: Array<Wallet | any> = [];

      if (mnemonic) {
        wallets = await deriveWalletsFromMnemonic(mnemonic, networks);
      } else if (privateKey) {
        wallets = await getWalletsForDifferentProviders(privateKey, networks);
      } else {
        throw new Error('Either mnemonic or private key must be provided');
      }

      await sendPauseTransactions(networks, wallets);

    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Failed to fetch shared config because of: ${err.message}`);
      } else {
        throw new Error('Something went wrong while fetching config file');
      }
    }
  })

program.parse(process.argv);
