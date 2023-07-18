import { providers, Wallet } from 'ethers';
import { Bridge } from "@buildwithsygma/sygma-contracts";
import { Domain, EthereumConfig, SubstrateConfig } from '@buildwithsygma/sygma-sdk-core';
import { DepositEvent } from '@buildwithsygma/sygma-contracts/dist/ethers/Bridge';
export declare function getWalletsForDifferentProviders(privateKey: string, networks: Array<Domain>): Promise<Wallet[]>;
export declare function deriveWalletsFromMnemonic(mnemonic: string, networks: Array<Domain>): Promise<string[]>;
export declare function sendPauseTransactions(networks: Array<any>, wallets: Array<Wallet | any>): Promise<import("ethers").ContractTransaction[]>;
export declare function getEvent(bridge: Bridge, transactionReceipt: providers.TransactionReceipt, eventName: string): Promise<DepositEvent>;
export declare function convertHexToString(hex: string): string;
export declare function printEventData(emittedEvent: DepositEvent): void;
export declare function getTransactionInfo(network: EthereumConfig | SubstrateConfig, transactionHash: string): Promise<void>;
//# sourceMappingURL=utils.d.ts.map