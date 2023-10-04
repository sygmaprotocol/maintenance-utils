import { KeyringPair } from '@polkadot/keyring/types'
import { GluegunToolbox, filesystem, print } from 'gluegun'
import {
  EthereumConfig,
  Network,
  SubstrateConfig,
} from '@buildwithsygma/sygma-sdk-core'
import { Wallet } from 'ethers'
import { InitializedWallets, RpcEndpoints } from '../../types'

import { testSubstrateRoutes } from '../../utils/substrate/test-routes'
import { testEvmRoutes } from '../../utils/evm/test-routes'

module.exports = {
  name: 'test-routes',
  run: async (toolbox: GluegunToolbox) => {
    const { sharedConfig, wallet } = toolbox

    const rawConfig = await sharedConfig.fetchSharedConfig()

    const { env } = toolbox
    const initializedWallets = (await wallet.initializeWallets(
      rawConfig
    )) as InitializedWallets

    const evmNetworks = rawConfig.domains.filter(
      (domain) => domain.type === Network.EVM
    ) as Array<EthereumConfig>

    const substrateNetworks = rawConfig.domains.filter(
      (domain) => domain.type === Network.SUBSTRATE
    ) as Array<SubstrateConfig>

    const rpcEndpoints = filesystem.read(
      'rpcEndpoints.json',
      'json'
    ) as RpcEndpoints


    const evmResult = await testEvmRoutes(
      evmNetworks,
      substrateNetworks,
      rpcEndpoints,
      initializedWallets[Network.EVM] as Wallet,
      initializedWallets[Network.SUBSTRATE] as unknown as KeyringPair,
      env
    )
    const substrateResult = await testSubstrateRoutes(
      evmNetworks,
      substrateNetworks,
      rpcEndpoints,
      initializedWallets[Network.EVM] as Wallet,
      initializedWallets[Network.SUBSTRATE] as unknown as KeyringPair,
      env
    )

    print.info(evmResult + substrateResult)
  },
}
