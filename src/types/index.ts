import { Network } from '@buildwithsygma/sygma-sdk-core'
import { KeyringPair } from '@polkadot/keyring/types'
import { Wallet } from 'ethers'

export type RpcEndpoints = {
  [key: string]: string
}

export type InitializedWallets = { [key in Network]: Wallet | KeyringPair }

export type BalanceConfig = {
  id: number
  chainId: number
  url: string
  type: Network
  nativeTokenMinBalance: string
  nativeBalanceData: Array<{ address: string; topic: string }>
}
