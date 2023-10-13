import { ChangeEvent, useState } from "react";

interface FileSelectorProps {
  onValidJsonLoad: (file: File) => void;
}

export const FileLoader = ({ onValidJsonLoad }: FileSelectorProps) => {
  const [errorMessage, setErrorMessage] = useState("");
  const handleSelection = ({
    target: { files },
  }: ChangeEvent<HTMLInputElement>) => {
    if (!files?.length) return;

    const [file] = files;
    if (file.type !== "application/json") {
      setErrorMessage("Invalid file. Please load a valid JSON file.");
      return;
    }
    onValidJsonLoad(file);
  };

  return (
    <main className="flex flex-col gap-4 items-center">
      <h1 className="text-black text-center font-bold text-4xl leading-none">
        JSON Tree Viewer
      </h1>
      <h2>
        Simple JSON Viewer that runs completely on-client. No data exchange
      </h2>
      <label
        htmlFor="file-upload"
        className="custom-file-upload leading-none text-xl"
      >
        Load JSON
      </label>
      <input
        value=""
        accept=".json"
        id="file-upload"
        type="file"
        onChange={handleSelection}
        className="hidden"
      />
      {errorMessage && <span id="error-message">{errorMessage}</span>}
    </main>
  );
};
