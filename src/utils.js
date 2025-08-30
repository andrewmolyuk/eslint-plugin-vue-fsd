export const runOnce = (ruleId) => {
  if (!global.__eslintVueFsdRunId) {
    global.__eslintVueFsdRunId = `${process.pid}_${process.cwd()}`
  }

  if (!global.__eslintVueFsdState) {
    global.__eslintVueFsdState = new Map()
  }

  const eslintRunId = global.__eslintVueFsdRunId
  if (!global.__eslintVueFsdState.has(eslintRunId)) {
    global.__eslintVueFsdState.set(eslintRunId, new Set())
  }

  const seen = global.__eslintVueFsdState.get(eslintRunId)
  if (seen.has(ruleId)) return false

  seen.add(ruleId)
  return true
}

export const parseRuleOptions = (context, defaultOptions) => {
  const options = context.options && context.options[0] ? context.options[0] : {}
  const parsed = {}

  for (const [key, value] of Object.entries(defaultOptions)) {
    parsed[key] = options[key] !== undefined ? options[key] : value

    if (Array.isArray(parsed[key])) {
      parsed[key] = parsed[key].map((item) => String(item).trim())
    } else if (typeof parsed[key] === 'string') {
      parsed[key] = String(parsed[key]).trim()
    }
  }

  return parsed
}
