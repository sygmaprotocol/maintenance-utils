import { Bridge } from '@buildwithsygma/sygma-contracts'
import { RawConfig } from '@buildwithsygma/sygma-sdk-core'
import { Wallet } from 'ethers'
import { BalanceConfig } from '../../src/types'

declare module 'gluegun' {
  interface GluegunToolbox {
    bridge: {
      initBridgeInstances(
        rawConfig: RawConfig,
        wallets: Array<Wallet | KeyringPair>
      ): Array<Bridge>
    }
    wallet: {
      initializeWallets(
        config: Array<EthereumConfig | SubstrateConfig | BalanceConfig>
      ): InitializedWallets
    }
    sharedConfig: {
      fetchSharedConfig(): Promise<RawConfig>
    }
    balanceConfig: {
      fetchBalanceConfig(): Promise<Array<BalanceConfig>>
    }
  }
}
