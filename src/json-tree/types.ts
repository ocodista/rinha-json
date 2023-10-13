export type JsonLeafType = string | number | boolean
export type JsonArrayType = JsonLeafType[]
export type JsonObjectType = {
  [key: string]: JsonLeafType | JsonArrayType | JsonObjectType
}
export type JsonType = JsonLeafType | JsonObjectType | JsonArrayType

