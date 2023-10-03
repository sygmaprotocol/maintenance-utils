import { Bridge } from '@buildwithsygma/sygma-contracts'
import { RawConfig } from '@buildwithsygma/sygma-sdk-core'
import { Wallet } from 'ethers'

declare module 'gluegun' {
  interface GluegunToolbox {
    bridge: {
      initBridgeInstances(
        rawConfig: RawConfig,
        wallets: Array<Wallet | KeyringPair>
      ): Array<Bridge>
    }
    wallet: {
      initializeWallets(rawConfig: RawConfig): InitializedWallets
    }
    sharedConfig: {
      fetchSharedConfig(): Promise<RawConfig>
    }
  }
}
