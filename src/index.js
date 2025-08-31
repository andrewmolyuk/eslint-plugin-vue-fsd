import meta from './meta.js'
import noProcessesLayer from './rules/no-processes-layer.js'
import sfcSectionsOrder from './rules/sfc-sections-order.js'
import fsdLayers from './rules/fsd-layers.js'
import publicApi from './rules/public-api.js'
import { getConfigs } from './configs.js'

const plugin = {
  meta,
  rules: {
    'no-processes-layer': noProcessesLayer,
    'sfc-sections-order': sfcSectionsOrder,
    'fsd-layers': fsdLayers,
    'public-api': publicApi,
  },
  processors: {},
  configs: {},
  utils: {},
}

plugin.configs = getConfigs(plugin)

export default plugin
