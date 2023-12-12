// Originally from https://github.com/Ivan-Korolenko/json-with-bigint/blob/main/json-with-bigint.js

// const bigInts = /([\[:])?"(\d+)n"([,\}\]])/g
const numbersBiggerThanMaxInt =
  /([\[:])?(\d{17,}|(?:[9](?:[1-9]07199254740991|0[1-9]7199254740991|00[8-9]199254740991|007[2-9]99254740991|007199[3-9]54740991|0071992[6-9]4740991|00719925[5-9]740991|007199254[8-9]40991|0071992547[5-9]0991|00719925474[1-9]991|00719925474099[2-9])))([,\}\]])/g

/*
  Function to serialize data to JSON string
  Converts BigInt values to custom format (strings with "n" at the end) and then converts them to proper big integers in JSON string
*/
export function JSONStringify<T>(data: T, space = 2): string {
  const preliminaryJSON = JSON.stringify(
    data,
    (_, value) => (typeof value === 'bigint' ? value.toString() + 'n' : value),
    space,
  )
  return preliminaryJSON.replace(/"(-?\d+)n"/g, (_, value) => value)
}

/*
    Function to parse JSON
    If JSON has values presented in a lib's custom format (strings with "n" character at the end), we just parse them to BigInt values (for backward compatibility with previous versions of the lib)
    If JSON has values greater than Number.MAX_SAFE_INTEGER, we convert those values to our custom format, then parse them to BigInt values.
    Other types of values are not affected and parsed as native JSON.parse() would parse them.
  */
export function JSONParse(json: string): any {
  /*
  Big numbers are found and marked using Regex with this condition:
  Number's length is bigger than 16 || Number's length is 16 and any numerical digit of the number is greater than that of the Number.MAX_SAFE_INTEGER
  */
  const serializedData = json.replace(numbersBiggerThanMaxInt, '$1"$2n"$3')
  return JSON.parse(serializedData, (_, value) => {
    switch (typeof value) {
      case 'number':
        if (Number.isSafeInteger(value)) return value
        return BigInt(value)
      case 'string':
        // Check if string matches bigIntString regex
        if (value.match(/(-?\d+)n/g)?.length) {
          // If string matches bigIntString regex, then it's a big integer
          // Remove "n" character from the end of the string and parse it to BigInt
          return BigInt(value.slice(0, -1))
        }
        return value
      default:
        return value
    }
  })
}
