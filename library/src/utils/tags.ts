export function tagToMs(args: Set<string>) {
  if (!args || args.size <= 0) return 0
  for (const arg of args) {
    if (arg.endsWith('ms')) {
      return Number(arg.replace('ms', ''))
    } else if (arg.endsWith('s')) {
      return Number(arg.replace('s', '')) * 1000
    }
    try {
      return parseFloat(arg)
    } catch (e) {}
  }
  return 0
}

export function tagHas(tags: Set<string>, tag: string, defaultValue = false) {
  if (!tags) return defaultValue
  return tags.has(tag.toLowerCase())
}
