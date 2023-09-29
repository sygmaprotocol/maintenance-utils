import { EthereumConfig } from '@buildwithsygma/sygma-sdk-core'
import { Wallet } from 'ethers'
import { RpcEndpoints } from '../../types'
import { EVM_BLOCK_CONFIRMATIONS } from '../../constants'
import { initEvmBridgeInstance } from '.'

export async function sendEvmUnpauseTransactions(
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
        const tx = await bridgeInstance.adminUnpauseTransfers({
          from: wallet.address,
        })
        console.log(
          `Transaction sent, waiting to for ${EVM_BLOCK_CONFIRMATIONS} block confirmations, transaction hash: ${tx.hash}`
        )
        const txReceipt = await tx.wait(EVM_BLOCK_CONFIRMATIONS)
        if (txReceipt) {
          console.log(
            `Successfully unpaused bridge on network with chainId ${tx.chainId}, bridge address: ${bridgeInstance.address}`
          )
        }
      } catch (err) {
        console.error(
          `Failed to unpause bridge because of: ${(err as Error).message}`
        )
      }
    })
  )
}
