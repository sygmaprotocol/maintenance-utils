import { providers, Wallet} from 'ethers';
import { chainIdToRpc } from "./constants";
import { Bridge, Bridge__factory } from "@buildwithsygma/sygma-contracts";
import { Domain, EthereumConfig, SubstrateConfig } from '@buildwithsygma/sygma-sdk-core';
import { DepositEvent } from '@buildwithsygma/sygma-contracts/dist/ethers/Bridge';
import { possibleEvents } from './constants';


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

export async function getEvent(bridge: Bridge, transactionReceipt: providers.TransactionReceipt, eventName: string){
  let filter; 

  switch (eventName.toLowerCase()){
    case possibleEvents[0]: 
      filter = bridge.filters.Deposit(null, null, null, null, null, null);
      break;
    case possibleEvents[1]:
      filter = bridge.filters.ProposalExecution(null, null, null, null);
      break;
    case possibleEvents[2]:
      filter = bridge.filters.FailedHandlerExecution(null,null,null)
      break;
    default: 
      throw new Error("Wrong event name in possibleEvents array")
  }

  const events = await bridge.queryFilter(filter, transactionReceipt.blockNumber, transactionReceipt.blockNumber);
  return events[0];
}

export function convertHexToString(hex: string) {
  var str = '';
  for (var i = 0; i < hex.length; i += 2) {
      var v = parseInt(hex.substring(i, i+2), 16);
      if (v) str += String.fromCharCode(v);
  }
  return str;
}   

export function printEventData(emittedEvent: DepositEvent){
  switch (emittedEvent.event?.toLowerCase()){
    case possibleEvents[0]: 
      console.log(`Transaction was successful.
      event: ${emittedEvent.event}
      destinationDomainID: ${emittedEvent.args[0]}
      depositNonce: ${emittedEvent.args[2]}`)
      break; 
    case possibleEvents[1]:
      console.log(`Transaction was successful.
      event: ${emittedEvent.event}
      originDomainID: ${emittedEvent.args[0]}
      depositNonce: ${emittedEvent.args[1]}`)
      break;
    case possibleEvents[2]:
      console.log(`Transaction wasn't successful
      event: ${emittedEvent.event}
      lowLevelData: ${convertHexToString(emittedEvent.args[0].toString().substring(10))}
      originDomainID: ${emittedEvent.args[1]}`)
      break;
  }
}

export async function getTransactionInfo(network: EthereumConfig | SubstrateConfig, transactionHash: string) {

  const rpc = chainIdToRpc[network.chainId as keyof typeof chainIdToRpc];
  const provider = new providers.JsonRpcProvider(rpc)

  const transactionReceipt = await provider.getTransactionReceipt(transactionHash);
  if (!transactionReceipt){
    throw new Error("Error while getting transaction receipt using transaction hash.")
  }
  if (transactionReceipt.status == 0){
    console.log("Transaction failed")
    process.exit(0)
  }

  const bridge = Bridge__factory.connect(network.bridge, provider);

  let event: any; 
  
  for (let eventName of possibleEvents){
    event = await getEvent(bridge, transactionReceipt, eventName)
    if (event != undefined){
      break; 
    }
  }
  
  if (event == undefined){
    console.log("Unrecognized event emitted")
  } else {
    printEventData(event);
  }

}

export async function retryTransaction(network: EthereumConfig | SubstrateConfig, transactionHash: string) {

  const rpc = chainIdToRpc[network.chainId as keyof typeof chainIdToRpc];
  const provider = new providers.JsonRpcProvider(rpc)

  const bridge = Bridge__factory.connect(network.bridge, provider);

  bridge.retry(transactionHash);

}
