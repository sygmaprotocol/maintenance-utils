import { GluegunToolbox, filesystem } from 'gluegun'
import { Network } from '@buildwithsygma/sygma-sdk-core'
import { Wallet } from 'ethers'
import { InitializedWallets, RpcEndpoints } from '../../types'
import { topUpEVMBalance } from '../../utils'

module.exports = {
  name: 'top-up',
  run: async (toolbox: GluegunToolbox) => {
    const { wallet, balanceConfig } = toolbox

    const currentBalanceConfig = await balanceConfig.fetchBalanceConfig()

    const initializedWallets = (await wallet.initializeWallets(
      currentBalanceConfig
    )) as InitializedWallets

    const evmNetworks = currentBalanceConfig.filter(
      (domain) => domain.type === Network.EVM
    )

    const rpcEndpoints = filesystem.read(
      'rpcEndpoints.json',
      'json'
    ) as RpcEndpoints

    await topUpEVMBalance(
      evmNetworks,
      rpcEndpoints,
      initializedWallets[Network.EVM] as Wallet
    )
  },
}
