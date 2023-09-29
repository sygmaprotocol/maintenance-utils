import { SubstrateConfig } from '@buildwithsygma/sygma-sdk-core'
import { KeyringPair } from '@polkadot/keyring/types'
import type { AccountInfo } from '@polkadot/types/interfaces'
import { RpcEndpoints } from '../../types'
import { initSubstrateProvider } from './index'

export async function sendSubstrateUnpauseTransactions(
  substrateConfigs: Array<SubstrateConfig>,
  rpcEndpoints: RpcEndpoints,
  sudo: KeyringPair,
  finalization: boolean
): Promise<void> {
  await Promise.all(
    substrateConfigs.map(async (network) => {
      const api = await initSubstrateProvider(rpcEndpoints, network)

      // eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
      return new Promise<void>(async (resolve, reject) => {
        const nonce = Number(
          (await api.query.system.account<AccountInfo>(sudo.address)).nonce
        )

        console.log(`Submitting extrinsic to unpause bridge, nonce: ${nonce}`)

        const unsub = await api.tx.sygmaBridge
          .unpauseAllBridges()
          .signAndSend(sudo, { nonce: nonce, era: 0 }, (result) => {
            console.log(`Current status is ${result.status.toString()}`)
            if (result.status.isInBlock) {
              console.log(
                `Transaction included at blockHash ${result.status.asInBlock.toString()}`
              )
              if (finalization) {
                console.log('Waiting for finalization...')
              } else {
                resolve()
                unsub()
              }
            } else if (result.status.isFinalized) {
              console.log(
                `Transaction finalized at blockHash ${result.status.asFinalized.toString()}`
              )
              unsub()
              resolve()
            } else if (result.isError) {
              console.error(`Transaction Error`)
              reject(`Transaction Error`)
            }
          })
      })
    })
  )
}
