import { useEffect, useState } from "react";
import { FileLoader } from "./FileLoader";
import { JsonFileVisualizer } from "./JsonVisualizer";
import { JSONParser } from "@streamparser/json";

const chunkSize = 500;

type Utils = {
  jsonParser: JSONParser | undefined;
  worker: Worker | undefined;
};

function App() {
  const [selectedFile, setSelectedFile] = useState<Partial<File>>({ name: "" });
  const [{ jsonParser, worker }, setUtils] = useState<Utils>({
    jsonParser: undefined,
    worker: undefined,
  });
  const [isLoading, setLoading] = useState(false);
  const [parsedJson, setJson] = useState<object | undefined>(undefined);
  const [page, setPage] = useState(0);

  const onSelectJsonFile = (file: File) => {
    setSelectedFile(file);
    if (!worker) throw new Error("Worker hasn't loaded yet...");
    worker?.postMessage({ file, chunkSize, currentPage: 0 });
  };

  useEffect(() => {
    const parser = new JSONParser();
    parser.onValue = (data) => {
      const { value, key, stack } = data;
      // if is object, the key is undefined
      // is is array, the key is not undefined and the stack, parent and value must be taken care off
      if (!key) {
        setJson(value as object);
      } else {
        console.log("handle array!", data);
        setJson(stack);
      }
    };
    setUtils({ jsonParser: parser, worker: new Worker("./worker.js") });
    return () => worker?.terminate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!worker) return;
    worker.onmessage = ({ data: { chunkText } }) => {
      if (!chunkText) {
        setLoading(false);
        return;
      }
      jsonParser?.write(chunkText);
      // TODO: Increase page on scroll bottom.
      if (page < 5) setPage(page + 1);
    };
  }, [jsonParser, page, worker]);

  useEffect(() => {
    if (!page) return;
    worker?.postMessage({ file: selectedFile, chunkSize, currentPage: page });
  }, [page, selectedFile, worker]);

  const showFileForm = !parsedJson && !isLoading;

  return (
    <main
      className={`bg-white flex w-screen h-full flex-col items-center${
        showFileForm ? " justify-center" : ""
      }`}
    >
      {parsedJson && (
        <JsonFileVisualizer
          name={(selectedFile as File).name}
          json={parsedJson}
        />
      )}
      {showFileForm && <FileLoader onValidJsonLoad={onSelectJsonFile} />}
      {isLoading && <span>Loading...</span>}
    </main>
  );
}

export default App;
