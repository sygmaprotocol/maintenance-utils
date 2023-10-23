import { SubstrateConfig } from '@buildwithsygma/sygma-sdk-core'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { RpcEndpoints } from '../../types'

export * from './pause'
export * from './unpause'
export * from './testSubstrateToEVMRoutes'

export async function initSubstrateProvider(
  rpcEndpoints: RpcEndpoints,
  network: SubstrateConfig
): Promise<ApiPromise> {
  const sygmaPalletProvider = new WsProvider(rpcEndpoints[network.chainId])
  return await ApiPromise.create({
    provider: sygmaPalletProvider,
  })
}
