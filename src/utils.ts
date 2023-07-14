import { ethers } from 'ethers';
import { chainIdToRpc } from "./constants";
import { Bridge__factory } from "@buildwithsygma/sygma-contracts";
import { Domain } from "@buildwithsygma/sygma-sdk-core";
import { THRESHOLD, TOP_UP_VALUE } from './constants';

export async function getWalletsForDifferentProviders(privateKey: string, networks: Array<Domain>) {
  const wallets = [];
  for (let i = 0; i < networks.length; i++) {
    const network = networks[i];
    const chainId = network.chainId;
    const rpc = chainIdToRpc[chainId as keyof typeof chainIdToRpc];
    if (!rpc) {
      throw new Error(`No rpc found for chain id: ${chainId}`);
    }
    const provider = new ethers.JsonRpcProvider(rpc);
    const wallet = new ethers.Wallet(privateKey, provider);
    const checkProviderStatus = await provider.getBalance(wallet.address);
    console.log(checkProviderStatus)
    wallets.push(wallet);
  }
  return wallets;
}

export async function deriveWalletsFromMnemonic(mnemonic: string, networks: Array<Domain>) {
  const wallets = [];
  for (let i = 0; i < networks.length; i++) {
    const network = networks[i];
    const chainId = network.chainId;
    const rpc = chainIdToRpc[chainId as keyof typeof chainIdToRpc];
    if (!rpc) {
      throw new Error(`No rpc found for chain id: ${chainId}`);
    }
    const provider = new ethers.JsonRpcProvider(rpc);
    const wallet = ethers.Wallet.fromPhrase(mnemonic, provider);
    wallets.push(wallet);
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

export async function checkBalanceOfRelayers(devConfig: Array<any>) {
  const relayersEligibleForTopUp = [];
  for (let i = 0; i < devConfig.length; i++) {
    const network = devConfig[i];
    const rpc = chainIdToRpc[network.chainId as keyof typeof chainIdToRpc];
    if (!rpc) {
      throw new Error(`No rpc found for chain id: ${network.chainId}`);
    }
    const provider = new ethers.JsonRpcProvider(rpc);
    const relayers = network.nativeBalanceData;
    for (let j = 0; j < relayers.length; j++) {
      const relayer = relayers[j];
      const balance = await provider.getBalance(relayer.address);
      console.log(`On chain id: ${network.chainId} relayer with address ${shortenEthereumAddress(relayer.address)} has balance of ${ethers.formatEther(balance)} ether`);
      if (balance < THRESHOLD) {
        console.log("Relayer is eligible for top up" + shortenEthereumAddress(relayer.address));
        relayersEligibleForTopUp.push({
          address: relayer.address, chainId: network.chainId
        });
      }
    }
  }
}

export async function sendTopUpTransactions(relayersToTopUp: Array<any>) {
  for (let i = 0; i < relayersToTopUp.length; i++) {
    const relayer = relayersToTopUp[i];
    const rpc = chainIdToRpc[relayer.chainId as keyof typeof chainIdToRpc];
    if (!rpc) {
      throw new Error(`No rpc found for chain id: ${relayer.chainId}`);
    }
    const provider = new ethers.JsonRpcProvider(rpc);
    const privateKey = process.env.PRIVATE_KEY_FOR_TOPUP_WALLET as string;
    const wallet = new ethers.Wallet(privateKey, provider);
    const tx = await wallet.sendTransaction({
      to: relayer.address,
      value: TOP_UP_VALUE,
    });
    console.log(`Transaction ${i + 1}/${relayersToTopUp.length} completed, relayer with address ${shortenEthereumAddress(relayer.address)} on chain id ${relayer.chainId} topped up, transaction hash: ${tx.hash}`);
  }
}

function shortenEthereumAddress(address: string) {
  return address.slice(0, 6) + "..." + address.slice(-4);
}