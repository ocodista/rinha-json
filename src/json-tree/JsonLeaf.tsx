import { JsonLeafType } from "./types"

export const JsonLeaf = ({ json }: { json: JsonLeafType }) => {
  if (json === null)
    return ""

  return typeof json === "string" ? `"${json}"` : json.toString()
}