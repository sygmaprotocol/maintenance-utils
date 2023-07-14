import { Wallet } from 'ethers';
import { Domain } from '@buildwithsygma/sygma-sdk-core';
export declare function getWalletsForDifferentProviders(privateKey: string, networks: Array<Domain>): Promise<Wallet[]>;
export declare function deriveWalletsFromMnemonic(mnemonic: string, networks: Array<Domain>): Promise<string[]>;
export declare function sendPauseTransactions(networks: Array<any>, wallets: Array<Wallet | any>): Promise<import("ethers").ContractTransaction[]>;
export declare function getTransactionInfo(networks: Array<any>, depositHash: string): Promise<void>;
//# sourceMappingURL=utils.d.ts.map