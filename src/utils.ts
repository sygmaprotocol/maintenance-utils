import { providers, Wallet} from 'ethers';
import { chainIdToRpc } from "./constants";
import { Bridge, Bridge__factory } from "@buildwithsygma/sygma-contracts";
import { Domain } from '@buildwithsygma/sygma-sdk-core';
import { DepositEvent } from '@buildwithsygma/sygma-contracts/dist/ethers/Bridge';


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

  const events = await bridge.queryFilter(filter, transactionReceipt.blockNumber, transactionReceipt.blockNumber);
  return events;
}

export function convertHexToString(hex: string) {
  var str = '';
  for (var i = 2; i < hex.length; i += 2) {
      var v = parseInt(hex.substring(i-2, i), 16);
      if (v) str += String.fromCharCode(v);
  }
  return str;
}   

export async function getTransactionInfo(networks: Array<any>, depositHash: string) {
  const rpc = chainIdToRpc[networks[0].chainId as keyof typeof chainIdToRpc];
  const provider = new providers.JsonRpcProvider(rpc)

  const transactionReceipt = await provider.getTransactionReceipt(depositHash);
  if (!transactionReceipt){
    throw new Error("Error while getting transaction receipt using deposit hash.")
  }

  const bridge = Bridge__factory.connect(networks[0].bridge, provider);

  let events: DepositEvent[] = []
  const possibleEvents: string[] = ["deposit", "proposalexecution", "failedhandlerexecution"]
  
  for (let eventName of possibleEvents){
    events = await getEvents(bridge, transactionReceipt, eventName)
    if (events.length != 0){
      break; 
    }
  }

  if (events.length == 0){
    throw new Error("Error while fetching event data")
  }

  if (events[0].event?.toLowerCase() == possibleEvents[0]){
    console.log(`Transaction was successful.
    event: ${events[0].event}
    destinationDomainID: ${events[0].args[0]}
    depositNonce: ${events[0].args[2]}`)
  } else if (events[0].event?.toLowerCase() == possibleEvents[1]){
    console.log(`Transaction was successful.
    event: ${events[0].event}
    originDomainID: ${events[0].args[0]}
    depositNonce: ${events[0].args[1]}`)
  } else if (events[0].event?.toLowerCase() == possibleEvents[2]) {
    
    //console.log(utils.parseBytes32String(events[0].args[0].toString()))
    console.log(convertHexToString(events[0].args[0].toString().substring(10)))
    console.log(`Transaction wasn't successful
    event: ${events[0].event}
    lowLevelData: ${events[0].args[0]}
    originDomainID: ${events[0].args[1]}`)
  } else {
    console.log("Unknown event.")
  }
}