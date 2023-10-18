import { BigNumber, Wallet, providers, utils } from 'ethers'
import { BalanceConfig, RpcEndpoints } from '../../types'
import { EVM_BLOCK_CONFIRMATIONS } from '../../constants'

export async function topUpEVMBalance(
  balanceConfig: Array<BalanceConfig>,
  rpcEndpoints: RpcEndpoints,
  wallet: Wallet
): Promise<void> {
  await Promise.all(
    balanceConfig.map(async (domain) => {
      const provider = new providers.JsonRpcProvider(
        rpcEndpoints[domain.chainId]
      )
      const signer = wallet.connect(provider)

      for (const relayer of domain.nativeBalanceData) {
        try {
          console.log(
            `Initiated relayer ${relayer.address} top up on network with chainId ${domain.chainId}`
          )
          const relayerBalance = await checkRelayerBalance(provider, relayer)
          if (
            BigNumber.from(relayerBalance).gt(
              utils.parseEther(domain.nativeTokenMinBalance)
            )
          ) {
            const topUpMultiplier = process.env.RELAYER_TOP_UP_MULTIPLIER || 5
            const topUpAmount = utils
              .parseEther(domain.nativeTokenMinBalance)
              .mul(topUpMultiplier)
            const receipt = await signer.sendTransaction({
              to: relayer.address,
              value: topUpAmount,
            })
            await receipt.wait(EVM_BLOCK_CONFIRMATIONS)
            console.log(
              `Successfully topped up relayer ${relayer.address} on network with chainId ${domain.chainId}`
            )
          } else {
            console.log(
              `Nothing to top up, relayer ${
                relayer.address
              } current balance is ${utils
                .formatEther(relayerBalance)
                .toString()}, min. balance threshold is ${
                domain.nativeTokenMinBalance
              }`
            )
          }
        } catch (err) {
          console.error(
            `Failed topping up relayer because of: ${(err as Error).message}`
          )
        }
      }
    })
  )
}

export async function checkRelayerBalance(
  provider: providers.JsonRpcProvider,
  relayer: { address: string; topic: string }
): Promise<string> {
  return (await provider.getBalance(relayer.address)).toString()
}
