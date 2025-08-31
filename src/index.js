import meta from './meta.js'
import noProcessesLayer from './rules/no-processes-layer.js'
import { getConfigs } from './configs.js'

const plugin = {
  meta,
  rules: {
    'no-processes-layer': noProcessesLayer,
  },
  processors: {},
  configs: {},
  utils: {},
}

plugin.configs = getConfigs(plugin)

export default plugin
