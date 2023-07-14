import { providers, Wallet } from 'ethers';
import { chainIdToRpc } from "./constants";
import { Bridge, Bridge__factory } from "@buildwithsygma/sygma-contracts";
import { Domain } from '@buildwithsygma/sygma-sdk-core';


export async function getWalletsForDifferentProviders(privateKey: string, networks: Array<Domain>) {
  const wallets = [];
  for (let i = 0; i < networks.length; i++) {
    const network = networks[i];
    const chainId = network.chainId;
    const rpc = chainIdToRpc[chainId as keyof typeof chainIdToRpc];
    if (rpc) {
      const provider = new providers.JsonRpcProvider(rpc);
      const wallet = new Wallet(privateKey, provider); // add error handling for invalid private key
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
      //const provider = new providers.JsonRpcProvider(rpc);
      const wallet = ""
      wallets.push(wallet);
    }
  }
  return wallets;
}

export async function sendPauseTransactions(networks: Array<any>, wallets: Array<Wallet | any>) {
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

export async function getEvents(bridge: Bridge, transactionReceipt: providers.TransactionReceipt, eventName: string){
  let filter; 

  switch (eventName.toLowerCase()){
    case "deposit": 
      filter = bridge.filters.Deposit(null, null, null, null, null, null);
      break;
    case "proposalexecution":
      filter = bridge.filters.ProposalExecution(null, null, null, null);
      break;
    case "failedhandlerexecution":
      filter = bridge.filters.FailedHandlerExecution(null,null,null)
      break;
    default: 
      throw new Error("Wrong event name")
  }
  const events = await bridge.queryFilter(filter, transactionReceipt.blockNumber, transactionReceipt.blockNumber)
  return events
}

export async function getTransactionInfo(networks: Array<any>, depositHash: string) {
  const rpc = chainIdToRpc[networks[0].chainId as keyof typeof chainIdToRpc];
  const provider = new providers.JsonRpcProvider(rpc)
  const transactionReceipt = await provider.getTransactionReceipt(depositHash);
  const bridge = Bridge__factory.connect(networks[0].bridge, provider);

  for (let eventName of ["deposit", "proposalexecution", "failedhandlerexecution"]){
    let events = await getEvents(bridge, transactionReceipt, eventName)
    if (events.length != 0){
      break; 
    }
  }

  if (transactionReceipt?.status == 1){
    console.log("Transaction was successful.")
  } else if (transactionReceipt?.status == 0){
    for (let log of transactionReceipt.logs){
      console.log(log) 
    }
  } else {
    throw new Error("Error while getting transaction receipt using deposit hash.")
  }
  for (let log of transactionReceipt.logs){
    console.log(log) 
  }
}