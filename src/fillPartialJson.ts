function count(str: string, char: string) {
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === char) {
      count++;
    }
  }
  return count;
}

export const fillPartialJson = (json: string) => {
  const lastValidProp = json.lastIndexOf("}")
  const cleanedJson = json.slice(0, lastValidProp)
  const openBrackets = count(cleanedJson, "{") 
  const closedBrackets = count(cleanedJson, "}")
  const missingBrackets = openBrackets - closedBrackets
  return cleanedJson+ "}".repeat(missingBrackets)
}
