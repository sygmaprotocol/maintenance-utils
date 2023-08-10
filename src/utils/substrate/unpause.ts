import { SubstrateConfig } from '@buildwithsygma/sygma-sdk-core'
import { KeyringPair } from '@polkadot/keyring/types'
import type { AccountInfo } from '@polkadot/types/interfaces'
import { RpcEndpoints } from '../../types'
import { EVM_DOMAIN_ID } from '../../constants'
import { initSubstrateProvider } from './index'

export async function sendSubstrateUnpauseTransaction(
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
          // this is temp since we have only one route,
          // we should add extrinsic that unpauses across all domains
          .unpauseBridge(EVM_DOMAIN_ID)
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
