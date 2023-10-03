import { KeyringPair } from '@polkadot/keyring/types'
import { GluegunToolbox, filesystem } from 'gluegun'
import {
  EthereumConfig,
  Network,
  SubstrateConfig,
} from '@buildwithsygma/sygma-sdk-core'
import { Wallet } from 'ethers'
import { InitializedWallets, RpcEndpoints } from '../../types'
import {
  sendEvmPauseTransactions,
  sendSubstratePauseTransactions,
} from '../../utils'

module.exports = {
  name: 'pause',
  run: async (toolbox: GluegunToolbox) => {
    const { sharedConfig, wallet } = toolbox

    const rawConfig = await sharedConfig.fetchSharedConfig()

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

    if (evmNetworks.length != 0) {
      await sendEvmPauseTransactions(
        evmNetworks,
        rpcEndpoints,
        initializedWallets[Network.EVM] as Wallet
      )
    }

    if (substrateNetworks.length != 0) {
      await sendSubstratePauseTransactions(
        substrateNetworks,
        rpcEndpoints,
        initializedWallets[Network.SUBSTRATE] as unknown as KeyringPair,
        true
      )
    }
  },
}
