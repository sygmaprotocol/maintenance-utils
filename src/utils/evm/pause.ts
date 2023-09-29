import { EthereumConfig } from '@buildwithsygma/sygma-sdk-core'
import { Wallet } from 'ethers'
import { RpcEndpoints } from '../../types'
import { EVM_BLOCK_CONFIRMATIONS } from '../../constants'
import { initEvmBridgeInstance } from '.'

export async function sendEvmPauseTransactions(
  ethereumConfigs: Array<EthereumConfig>,
  rpcEndpoints: RpcEndpoints,
  wallet: Wallet
): Promise<void> {
  await Promise.all(
    ethereumConfigs.map(async (network) => {
      const bridgeInstance = initEvmBridgeInstance(
        rpcEndpoints[network.chainId],
        network,
        wallet
      )

      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const tx = await bridgeInstance.adminPauseTransfers({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          from: wallet.address,
        })
        console.log(
          `Transaction sent, waiting to for ${EVM_BLOCK_CONFIRMATIONS} block confirmations, transaction hash: ${tx.hash}`
        )
        const txReceipt = await tx.wait(EVM_BLOCK_CONFIRMATIONS)
        if (txReceipt) {
          console.log(
            `Successfully paused bridge on network with chainId ${tx.chainId}, bridge address: ${bridgeInstance.address}`
          )
        }
      } catch (err) {
        console.error(
          `Failed to pause bridge because of: ${(err as Error).message}`
        )
      }
    })
  )
}
