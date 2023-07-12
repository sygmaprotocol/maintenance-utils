import { ethers } from 'ethers';
export declare function getWalletsForDifferentProviders(privateKey: string, networks: Array<any>): Promise<ethers.Wallet[]>;
export declare function deriveWalletsFromMnemonic(mnemonic: string, networks: Array<any>): Promise<ethers.HDNodeWallet[]>;
export declare function sendPauseTransactions(networks: Array<any>, wallets: Array<ethers.Wallet>): Promise<any[]>;
//# sourceMappingURL=utils.d.ts.map