import { JsonObjectType, JsonTree } from "./JsonTree"

interface JsonObjectProp {
  json: JsonObjectType
}
export const JsonObject = ({ json }: JsonObjectProp) => {
  const props = Object.keys(json)

  return props.map((prop) => {
    const right = json[prop]
    return (
      <div key={prop}>
        <span aria-label={prop}>{`${prop}: `}</span>
        <JsonTree json={right} />
      </div>
    )
  })
}
