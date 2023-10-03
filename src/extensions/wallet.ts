import { Network, RawConfig } from '@buildwithsygma/sygma-sdk-core'
import { Wallet } from 'ethers'
import { GluegunToolbox, prompt } from 'gluegun'
import { Keyring } from '@polkadot/api'
import { InitializedWallets } from '../types'

module.exports = (toolbox: GluegunToolbox) => {
  async function initializeWallets(
    rawConfig: RawConfig
  ): Promise<InitializedWallets> {
    // get only single unique network type values from config
    const networkTypes: string[] = Array.from(
      new Set(rawConfig.domains.map((domain) => domain.type))
    )

    const wallets: InitializedWallets = {} as unknown as InitializedWallets
    for await (const networkType of networkTypes) {
      const result = await prompt.ask([
        {
          type: 'input',
          name: 'initWallet',
          message: `Enter wallet mnemonic or private key for ${networkType} network`,
        },
      ])

      switch (networkType) {
        case Network.EVM: {
          // check if private key (len = 1) or mnemonic (len > 1) was provided
          const inputString = result.initWallet.split(' ')
          if (inputString.length > 1) {
            wallets[Network.EVM] = Wallet.fromMnemonic(result.initWallet)
          } else {
            wallets[Network.EVM] = new Wallet(result.initWallet)
          }
          break
        }
        case Network.SUBSTRATE: {
          const keyring = new Keyring({ type: 'sr25519' })
          wallets[Network.SUBSTRATE] = keyring.addFromMnemonic(
            result.initWallet
          )
          break
        }
        default:
          throw new Error('Unsupported network, failed to initialize wallet.')
      }
    }
    return wallets
  }
  toolbox.wallet = { initializeWallets }
}
