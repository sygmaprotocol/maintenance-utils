import axios from 'axios';
import {Command, Option} from 'commander';
import {ConfigUrl} from "./constants";
import {RawConfig} from "@buildwithsygma/sygma-sdk-core";

const program = new Command();
console.log("pero");

program
  .name("pause-bridge")
  .description("Pauses all bridge instances across all networks")
  .argument("<string>", "mnemonic or private key of the wallet")
  .addOption(
    new Option('--environment, -e', 'Environment on which to pause bridge instances')
      .choices(['devnet', 'testnet', 'mainnet'])
  )
  .action(async (mnemonic: string, environment: keyof typeof ConfigUrl) => {
    try {
      console.log("pero");
      const response = await axios.get(ConfigUrl[environment]) as unknown as RawConfig;
      console.log(response)
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Failed to fetch shared config because of: ${err.message}`);
      } else {
        throw new Error('Something went wrong while fetching config file');
      }
    }
  })
