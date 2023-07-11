import axios from 'axios';
import {Command, Option} from 'commander';
import {ConfigUrl} from "./constants";
import {getWalletsForDifferentProviders, deriveWalletsFromMnemonic, sendPauseTransactions} from "./utils";

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
      const network: keyof typeof ConfigUrl = configs.environment;
      const {
        privateKey,
        mnemonic
      } = configs;

      const response = await axios.get(ConfigUrl[network]) as any;
      const networks = response.data.domains.filter((network: any) => network.type === "evm"); // just evms for now

      let wallets: any = [];

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
