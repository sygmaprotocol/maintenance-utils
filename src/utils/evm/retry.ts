import { EthereumConfig } from '@buildwithsygma/sygma-sdk-core'
import { Wallet } from 'ethers'
import { print } from 'gluegun'
import { EVM_BLOCK_CONFIRMATIONS } from '../../constants'
import { initEvmBridgeInstance } from '.'

export async function sendEvmRetryTransaction(
  targetEvmDomain: EthereumConfig,
  rpcEndpoint: string,
  wallet: Wallet,
  txHash: string
): Promise<void> {
  const bridgeInstance = initEvmBridgeInstance(
    rpcEndpoint,
    targetEvmDomain,
    wallet
  )

  try {
    const tx = await bridgeInstance.retry(txHash, {
      from: wallet.address,
    })
    print.info(
      `Transaction sent, waiting to for ${EVM_BLOCK_CONFIRMATIONS} block confirmations, transaction hash: ${tx.hash}`
    )
    const txReceipt = await tx.wait(EVM_BLOCK_CONFIRMATIONS)
    if (txReceipt) {
      print.success(
        `Successfully retried tx: ${txHash} on network with chainId ${tx.chainId}, new transaction hash: ${tx.hash}`
      )
    }
  } catch (err) {
    print.error(
      `Failed to retry transaction because of: ${(err as Error).message}`
    )
  }
}
