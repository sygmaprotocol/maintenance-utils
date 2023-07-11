import { ethers } from 'ethers';
export declare function getWalletsForDifferentProviders(privateKey: string, networks: any): Promise<ethers.Wallet[]>;
export declare function deriveWalletsFromMnemonic(mnemonic: string, networks: any): Promise<ethers.HDNodeWallet[]>;
export declare function sendPauseTransactions(networks: any, wallets: any): Promise<any[]>;
//# sourceMappingURL=utils.d.ts.map