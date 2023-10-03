import { Bridge, Bridge__factory } from '@buildwithsygma/sygma-contracts'
import { EthereumConfig } from '@buildwithsygma/sygma-sdk-core'
import { Wallet, providers } from 'ethers'

export * from './pause'
export * from './unpause'
export * from './retry'

export function initEvmBridgeInstance(
  rpcEndpoint: string,
  network: EthereumConfig,
  wallet: Wallet
): Bridge {
  const provider = new providers.JsonRpcProvider(rpcEndpoint)
  const bridgeContract = Bridge__factory.connect(network.bridge, provider)
  const signer = wallet.connect(provider)
  return bridgeContract.connect(signer)
}
