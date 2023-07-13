import 'dotenv/config';
import axios from 'axios';
import { ethers } from 'ethers';
import { Command, Option } from 'commander';
import { SharedConfig } from "./constants";
import { getWalletsForDifferentProviders, deriveWalletsFromMnemonic, sendPauseTransactions } from "./utils";
import { RawConfig, Domain } from '@buildwithsygma/sygma-sdk-core';
import { config } from 'process';


const program = new Command();

program
    .name("debug-bridge")
    .description("Enables quick debugging of specific Sygma messages (bridging request)")
    .addOption(
        new Option("-e, --environment <environment>", "Environment on which to debug")
            .choices(["devnet", "mainnet", "testnet"])
    )
    .addOption(
        new Option("-d, --deposit", "Deposit transaction on which to provide status")
    ).action(async(configs: any) => {

    })



program.parse(process.argv)
