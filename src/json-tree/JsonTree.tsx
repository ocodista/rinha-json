import { ArrayProp } from "./ArrayProp";
import { JsonLeaf } from "./JsonLeaf";
import { JsonObject } from "./JsonObject";
import { JsonType } from "./types";

interface JsonTreeProps {
  json: JsonType
}

export const JsonTree = ({ json }: JsonTreeProps) => {
  if (Array.isArray(json))
    return <ArrayProp arr={json} />

  if (json === null || typeof json === "undefined")
    return ""

  if (typeof json === "object") {
    return <JsonObject json={json} />
  }

  return <JsonLeaf json={json} />
}

