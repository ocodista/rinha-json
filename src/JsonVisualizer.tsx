import React from 'react'

interface JsonViewerProps {
  json: any
  depth?: number
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