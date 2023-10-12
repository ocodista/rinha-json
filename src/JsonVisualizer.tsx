import React from 'react'

type JsonViewerProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  json: Record<string, any>
  depth?: number
}

type JsonFileVisualizer = JsonViewerProps & {
  name: string;
}

export const JsonFileVisualizer = ({ name, ...other }: JsonFileVisualizer) => {
  return (
    <>
      <h1>{name}</h1>
      <JsonVisualizer {...other} />
    </>
  )
}

export const JsonVisualizer: React.FC<JsonViewerProps> = ({ json, depth = 0 }) => {
  const keys = Object.keys(json)

  return (
    <div className="pl-4">
      {keys.map((key) => {
        const value = json[key]
        return (
          <div key={key}>
            <div className="font-bold">{key}</div>
            {typeof value === 'object' && value !== null ? (
              <JsonVisualizer json={value} depth={depth + 1} />
            ) : (
              <div className="pl-4">{value}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}