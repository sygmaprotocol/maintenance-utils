export const EVM_BLOCK_CONFIRMATIONS: number = Number(
  process.env.EVM_BLOCK_CONFIRMATIONS || 5
)
export const RELAYER_TOP_UP_MULTIPLIER: number = Number(
  process.env.RELAYER_TOP_UP_MULTIPLIER || 5
)

export * from './balanceConfig'
