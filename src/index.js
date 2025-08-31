import meta from './meta.js'
import noProcessesLayer from './rules/no-processes-layer.js'
import sfcSectionsOrder from './rules/sfc-sections-order.js'
import { getConfigs } from './configs.js'

const plugin = {
  meta,
  rules: {
    'no-processes-layer': noProcessesLayer,
    'sfc-sections-order': sfcSectionsOrder,
  },
  processors: {},
  configs: {},
  utils: {},
}

plugin.configs = getConfigs(plugin)

export default plugin
