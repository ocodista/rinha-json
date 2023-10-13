import { JsonLeafType } from "./types"

export const JsonLeaf = ({ json }: { json: JsonLeafType }) => {
  return typeof json === "string" ? `"${json}"` : json.toString()
}