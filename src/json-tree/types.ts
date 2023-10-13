export type JsonLeafType = string | number | boolean | null
export type JsonArrayType = JsonType[]
export type JsonObjectType = {
  [key: string]: JsonLeafType | JsonArrayType | JsonObjectType
}
export type JsonType = JsonLeafType | JsonObjectType | JsonArrayType

