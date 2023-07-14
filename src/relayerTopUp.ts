import axios from "axios";
import { Command, Option } from "commander";
import { sendTopUpTransactions, checkBalanceOfRelayers } from "utils";
import { Relayers } from "./constants";

const program = new Command();

program
    .name("relayer-top-up")
    .description("Send top up transactions to relayers if their balance is below a certain threshold")
    .version("0.0.1")

program
    .command("top-up-relayers")
    .addOption(
        new Option('-e, --environment <environment>', 'Environment on which to top up relayers')
            .choices(['devnet', 'testnet', 'mainnet'])
    )
    .addOption(
        new Option('-c, --check-only', 'Check only the balances of relayers, do not send top up transactions')
    )
    .action(async (configs: any) => {

        /**
         * 
         * - Change typescript types from any to something more specific
         * - Test on devnet, testnet when you get official api
         * 
         */

        const network: keyof typeof Relayers = configs.environment;

        const {
            data
        } = await axios.get(Relayers[network]) as any;

        const relayersEligibleForTopUp: any = await checkBalanceOfRelayers(data);

        if (!configs.checkOnly) {
            await sendTopUpTransactions(relayersEligibleForTopUp);
        }
    })

program.parse(process.argv);
