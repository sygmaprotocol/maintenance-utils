import {ethers} from 'ethers';
import {chainIdToRpc, bridgeAbi} from "./constants";

export async function getWalletsForDifferentProviders(privateKey: string, networks: Array<any>) {
  const wallets = [];
  for (let i = 0; i < networks.length; i++) {
    const network = networks[i];
    const chainId: keyof typeof chainIdToRpc = network.chainId;
    const rpc = chainIdToRpc[chainId];
    if (rpc) {
        const provider = new ethers.JsonRpcProvider(rpc);
        const wallet = new ethers.Wallet(privateKey, provider); // add error handling for invalid private key
        wallets.push(wallet);
    }
  }
  return wallets;
}

export async function deriveWalletsFromMnemonic(mnemonic: string, networks: Array<any>) {
  const wallets = [];
  for (let i = 0; i < networks.length; i++) {
    const network = networks[i];
    const chainId: keyof typeof chainIdToRpc = network.chainId;
    const rpc = chainIdToRpc[chainId];
    if (rpc) {
        const provider = new ethers.JsonRpcProvider(rpc);
        const wallet = ethers.Wallet.fromPhrase(mnemonic, provider);
        wallets.push(wallet);
    }
  }
  return wallets;
}

export async function sendPauseTransactions(networks: Array<any>, wallets: Array<ethers.Wallet>) {
    const receipts = [];
    for (let i = 0; i < networks.length; i++) {
        const network = networks[i];
        const wallet = wallets[i];
        const bridge = await getBridgeContractInstance(network, wallet)
        const tx = await bridge.pause();
        const receipt = await tx.wait();
        console.log(`Transaction no. ${i+1} completed, bridge on ${network.name} paused`);
        receipts.push(receipt);
    }
    return receipts;
}

async function getBridgeContractInstance(network: any, wallet: ethers.Wallet) {
    const bridge = new ethers.Contract(network.bridge, bridgeAbi, wallet);
    return bridge;
}