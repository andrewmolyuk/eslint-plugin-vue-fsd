import meta from './meta.js'
import noProcessesLayer from './rules/no-processes-layer.js'
import sfcSectionsOrder from './rules/sfc-sections-order.js'
import fsdLayers from './rules/fsd-layers.js'
import publicApi from './rules/public-api.js'
import noUiInApp from './rules/no-ui-in-app.js'
import noLayerPublicApi from './rules/no-layer-public-api.js'
import noHigherLevelImports from './rules/no-higher-level-imports.js'
import noCrossSliceImports from './rules/no-cross-slice-imports.js'
import { getConfigs } from './configs.js'

const plugin = {
  meta,
  rules: {
    'no-processes-layer': noProcessesLayer,
    'sfc-sections-order': sfcSectionsOrder,
    'fsd-layers': fsdLayers,
    'public-api': publicApi,
    'no-ui-in-app': noUiInApp,
    'no-layer-public-api': noLayerPublicApi,
    'no-higher-level-imports': noHigherLevelImports,
    'no-cross-slice-imports': noCrossSliceImports,
  },
  processors: {},
  configs: {},
  utils: {},
}

plugin.configs = getConfigs(plugin)

export default plugin
