import { GluegunToolbox, filesystem, prompt } from 'gluegun'
import { EthereumConfig, Network } from '@buildwithsygma/sygma-sdk-core'
import { Wallet } from 'ethers'
import { InitializedWallets, RpcEndpoints } from '../../types'
import { sendEvmRetryTransaction } from '../../utils'

module.exports = {
  name: 'retry',
  run: async (toolbox: GluegunToolbox) => {
    const { sharedConfig, wallet } = toolbox

    const rawConfig = await sharedConfig.fetchSharedConfig()

    const initializedWallets = (await wallet.initializeWallets(
      rawConfig.domains
    )) as InitializedWallets

    const networkPrompt: { chainId: string } = await prompt.ask({
      type: 'select',
      name: 'chainId',
      message: 'On which network do you want to retry a transaction',
      choices: rawConfig.domains.map((network) => String(network.chainId)),
    })

    const transactionPrompt: { txHash: string } = await prompt.ask({
      type: 'input',
      name: 'txHash',
      message: 'Enter transaction hash which you want to retry',
    })

    const matchingDomain = rawConfig.domains.find(
      (domain) => domain.chainId.toString() === networkPrompt.chainId
    )

    const rpcEndpoints = filesystem.read(
      'rpcEndpoints.json',
      'json'
    ) as RpcEndpoints

    await sendEvmRetryTransaction(
      matchingDomain as unknown as EthereumConfig,
      rpcEndpoints[networkPrompt.chainId],
      initializedWallets[Network.EVM] as Wallet,
      transactionPrompt.txHash
    )
  },
}
