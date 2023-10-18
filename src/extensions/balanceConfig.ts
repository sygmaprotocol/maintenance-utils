import { GluegunToolbox, prompt, http } from 'gluegun'
import { Environment } from '@buildwithsygma/sygma-sdk-core'
import { BalanceConfig } from '../types'
import { BALANCE_CONFIG_URL } from '../constants'

module.exports = (toolbox: GluegunToolbox) => {
  async function fetchBalanceConfig(): Promise<Array<BalanceConfig>> {
    const result: { env: Environment } = await prompt.ask({
      type: 'select',
      name: 'env',
      message: "Which environment's balance config would you like to retrieve?",
      choices: Object.keys(Environment),
    })

    const api = http.create({
      baseURL: BALANCE_CONFIG_URL[result.env] as string,
    })
    BALANCE_CONFIG_URL[result.env]
    /**
     * This is an empty string because we don't have a unique base url
     * across all environments. To avoid excess logic
     * the whole shared config url is passed as base url.
     */
    const { ok, data } = await api.get('')
    if (!ok) {
      throw new Error('Failed to fetch shared config.')
    }
    return data as Array<BalanceConfig>
  }
  toolbox.balanceConfig = { fetchBalanceConfig }
}
