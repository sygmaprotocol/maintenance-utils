import { GluegunToolbox, prompt, http, filesystem } from 'gluegun'
import {
  ConfigUrl,
  RawConfig,
  Environment,
} from '@buildwithsygma/sygma-sdk-core'

module.exports = (toolbox: GluegunToolbox) => {
  async function fetchSharedConfig(): Promise<RawConfig> {
    const result: { env: Environment } = await prompt.ask({
      type: 'select',
      name: 'env',
      message: "Which environment's shared config would you like to retrieve?",
      choices: Object.keys(Environment),
    })

    // if local environment selected, configure shared-config through sharedConfig.json
    if(result.env.toLowerCase() == Environment.LOCAL) {
      return filesystem.read(
        'sharedConfig.json',
        'json'
      ) as RawConfig
    }

    const api = http.create({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      baseURL: ConfigUrl[result.env],
    })
    ConfigUrl[result.env]
    /**
     * This is an empty string because we don't have a unique base url
     * across all environments. To avoid excess logic
     * the whole shared config url is passed as base url.
     */
    const { ok, data } = await api.get('')
    if (!ok) {
      throw new Error('Failed to fetch shared config.')
    }
    toolbox.env = result.env
    return data as RawConfig
  }
  toolbox.sharedConfig = { fetchSharedConfig }
}
