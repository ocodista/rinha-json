import { JsonTree } from "./JsonTree"
import { JsonArrayType, JsonType } from "./types"

interface ArrayProp {
  arr: JsonArrayType
}
export const ArrayProp = ({ arr = [] }: ArrayProp) => {
  const indexes = Object.keys(arr) as unknown as number[]

  return (
    <>
      <span aria-label="array-start">{"["}</span>
      {indexes.map((index) => {
        const indexValue: JsonType = arr[index]
        return (
          <div aria-label="inside-array" key={index}>
            <span aria-label="array-prop-index">{`${index}: `}</span>
            <JsonTree json={indexValue} />
          </div>
        )
      })}
      <span aria-label="array-end">{"]"}</span>
    </>
  )
} 