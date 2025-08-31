export const getConfigs = (plugin) => {
  const recommendedRules = {
    'vue-fsd/no-processes-layer': 'error',
    'vue-fsd/sfc-sections-order': 'error',
  }
  const allRules = { ...recommendedRules }

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
