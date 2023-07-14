import { ethers } from 'ethers';
import { Domain } from "@buildwithsygma/sygma-sdk-core";
export declare function getWalletsForDifferentProviders(privateKey: string, networks: Array<Domain>): Promise<ethers.Wallet[]>;
export declare function deriveWalletsFromMnemonic(mnemonic: string, networks: Array<Domain>): Promise<ethers.HDNodeWallet[]>;
export declare function sendPauseTransactions(networks: Array<any>, wallets: Array<ethers.Wallet | ethers.HDNodeWallet>): Promise<ethers.ContractTransaction[]>;
export declare function getTransactionInfo(depositHash: string, chainId: number): Promise<void>;
//# sourceMappingURL=utils.d.ts.map