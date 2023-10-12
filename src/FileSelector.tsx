import React, { ChangeEvent, useState } from "react"

interface FileSelectorProps {
  onValidJsonLoad: (file: File) => void
}

export const FileSelector = ({ onValidJsonLoad }: FileSelectorProps) => {
  const [errorMessage, setErrorMessage] = useState("")
  const handleSelection = ({ target: { files } }: ChangeEvent<HTMLInputElement>) => {
    if (!files?.length)
      return

    const [file] = files
    if (file.type !== "application/json") {
      setErrorMessage("Invalid file. Please load a valid JSON file.")
      return
    }
    onValidJsonLoad(file)
  }

  return (
    <>
      <h1>JSON Tree Viewer</h1>
      <h2>Simple JSON Viewer that runs completely on-client. No data exchange</h2>
      <label htmlFor="file-upload" className="custom-file-upload">
        Load JSON
      </label>
      <input accept=".json" id="file-upload" type="file" onChange={handleSelection} />
      {errorMessage && <span id="error-message">{errorMessage}</span>}
    </>
  )
}