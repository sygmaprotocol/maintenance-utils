import { GluegunToolbox, build } from 'gluegun'
import { Options } from 'gluegun/build/types/domain/options'
import 'dotenv/config'

/**
 * Create the cli and kick it off
 */
async function run(argv: Options): Promise<GluegunToolbox> {
  // create a CLI runtime
  const cli = build()
    .brand('maintenance-utils')
    .src(__dirname)
    .plugins('./node_modules', {
      matching: 'maintenance-utils-*',
      hidden: true,
    })
    .help() // provides default for help, h, --help, -h
    .version() // provides default for version, v, --version, -v
    .create()
  // enable the following method if you'd like to skip loading one of these core extensions
  // this can improve performance if they're not necessary for your project:
  // .exclude(['meta', 'strings', 'print', 'filesystem', 'semver', 'system', 'prompt', 'http', 'template', 'patching', 'package-manager'])
  // and run it
  const toolbox = await cli.run(argv).finally(() => process.exit())

  // send it back (for testing, mostly)
  return toolbox
}

module.exports = { run }
