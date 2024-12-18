export const isBoolString = (str: string) => str.trim() === 'true'

export const kebabize = (str: string) =>
  str.replace(
    /[A-Z]+(?![a-z])|[A-Z]/g,
    ($, ofs) => (ofs ? '-' : '') + $.toLowerCase(),
  )

export const camelize = (str: string) =>
  str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => index === 0 ? word.toLowerCase() : word.toUpperCase())
    .replace(/\s+/g, '')

export const jsStrToObject = (raw: string) => {
  return new Function(`return Object.assign({}, ${raw})`)()
}
