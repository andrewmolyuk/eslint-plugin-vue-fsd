export const getConfigs = (plugin) => {
  const recommendedRules = {
    'vue-fsd/no-processes-layer': 'error',
    'vue-fsd/no-layer-public-api': 'error',
    'vue-fsd/no-higher-level-imports': 'error',
    'vue-fsd/sfc-sections-order': 'error',
    'vue-fsd/fsd-layers': 'error',
    'vue-fsd/public-api': 'error',
    'vue-fsd/no-cross-slice-imports': 'error',
  }
  const allRules = {
    ...recommendedRules,
    'vue-fsd/no-ui-in-app': 'error',
  }

  const languageOptions = {
    ecmaVersion: 2022,
    sourceType: 'module',
  }

  const pluginConfig = (plugin, rules) => ({
    plugins: { 'vue-fsd': plugin },
    rules,
    languageOptions,
  })

  const legacyConfig = (rules) => ({
    plugins: ['vue-fsd'],
    rules,
  })

  return {
    recommended: [pluginConfig(plugin, recommendedRules)],
    all: [pluginConfig(plugin, allRules)],
    'legacy/recommended': legacyConfig(recommendedRules),
    'legacy/all': legacyConfig(allRules),
  }
}
