import { ethers } from 'ethers';
import { chainIdToRpc } from "./constants";
import { Bridge__factory } from "@buildwithsygma/sygma-contracts";
import { Domain } from "@buildwithsygma/sygma-sdk-core";

export async function getWalletsForDifferentProviders(privateKey: string, networks: Array<Domain>) {
  const wallets = [];
  for (let i = 0; i < networks.length; i++) {
    const network = networks[i];
    const chainId = network.chainId;
    const rpc = chainIdToRpc[chainId as keyof typeof chainIdToRpc];
    if (rpc) {
      const provider = new ethers.JsonRpcProvider(rpc);
      const wallet = new ethers.Wallet(privateKey, provider); // add error handling for invalid private key
      wallets.push(wallet);
    }
  }
  return wallets;
}

export async function deriveWalletsFromMnemonic(mnemonic: string, networks: Array<Domain>) {
  const wallets = [];
  for (let i = 0; i < networks.length; i++) {
    const network = networks[i];
    const chainId = network.chainId;
    const rpc = chainIdToRpc[chainId as keyof typeof chainIdToRpc];
    if (rpc) {
      const provider = new ethers.JsonRpcProvider(rpc);
      const wallet = ethers.Wallet.fromPhrase(mnemonic, provider);
      wallets.push(wallet);
    }
  }
  return wallets;
}

export async function sendPauseTransactions(networks: Array<any>, wallets: Array<ethers.Wallet | ethers.HDNodeWallet>) {
  const receipts = [];
  for (let i = 0; i < networks.length; i++) {
    const network = networks[i];
    const wallet = wallets[i];
    const bridge = Bridge__factory.connect(network.bridge, wallet);
    const tx = await bridge.adminPauseTransfers();
    console.log(`Transaction no. ${i + 1} completed, bridge on ${network.name} paused`);
    receipts.push(tx);
  }
  return receipts;
} 

export async function getTransactionInfo(depositHash: string, chainId: number) {
  const rpc = chainIdToRpc[chainId as keyof typeof chainIdToRpc];
  const provider = new ethers.JsonRpcProvider(rpc)
  const transactionReceipt = await provider.getTransactionReceipt(depositHash);

  if (transactionReceipt?.status == 1){
    console.log("Transaction was successful.")
  } else if (transactionReceipt?.status == 0){
    for (let log of transactionReceipt.logs){
      console.log(log) 
    }
  } else {
    throw new Error("Error while getting transaction receipt using deposit hash.")
  }
  
}