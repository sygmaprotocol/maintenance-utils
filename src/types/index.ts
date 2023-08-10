import { Network } from '@buildwithsygma/sygma-sdk-core'
import { KeyringPair } from '@polkadot/keyring/types'
import { Wallet } from 'ethers'

export type RpcEndpoints = {
  [key: string]: string
}

export type InitializedWallets = { [key in Network]: Wallet | KeyringPair }
