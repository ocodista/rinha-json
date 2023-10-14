import { useEffect, useState } from "react";
import { FileLoader } from "./FileLoader";
import { JSONParser } from "@streamparser/json";
import { JsonFileVisualizer } from "./JsonFileVisualizer";
import { JsonType } from "./json-tree/types";

const chunkSize = 500;

type Nullable<T> = T | undefined;

type ParseUtils = {
  jsonParser: Nullable<JSONParser>;
  worker: Nullable<Worker>;
};

type FileUtils = {
  totalPages: number;
  file: Nullable<File>;
};

function App() {
  const [{ file, totalPages }, setFileUtils] = useState<FileUtils>({
    totalPages: 0,
    file: undefined,
  });
  const [{ jsonParser, worker }, setUtils] = useState<ParseUtils>({
    jsonParser: undefined,
    worker: undefined,
  });
  const [isLoading, setLoading] = useState(false);
  const [parsedJson, setJson] = useState<Nullable<JsonType>>(undefined);
  const [page, setPage] = useState(0);

  const onSelectJsonFile = (file: File) => {
    const totalPages = Math.ceil(file.size / chunkSize);
    setFileUtils({
      totalPages,
      file,
    });
    if (!worker) throw new Error("Worker hasn't loaded yet...");
    worker?.postMessage({ file, chunkSize, currentPage: 0 });
  };

  useEffect(() => {
    const parser = new JSONParser({
      stringBufferSize: chunkSize,
    });

    parser.onValue = (data) => {
      console.log("onValue", data);
      const { value, key, stack } = data;
      // if is object, the key is undefined
      // is is array, the key is not undefined and the stack, parent and value must be taken care off
      if (!key) {
        setJson(value as JsonType);
      } else {
        setJson(stack as unknown as JsonType);
      }
    };
    setUtils({ jsonParser: parser, worker: new Worker("./worker.js") });
    return () => {
      worker?.terminate();
      parser?.end();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!worker) return;
    worker.onmessage = ({ data: { chunkText } }) => {
      console.log("message!");
      if (!chunkText) {
        setLoading(false);
        return;
      }
      jsonParser?.write(chunkText);

      if (page + 1 >= totalPages) {
        console.log("ended reading json!", totalPages);
        if (!jsonParser?.isEnded) jsonParser?.end();
        worker?.terminate();
        return;
      }

      // TODO: Increase page only when scroll hits bottom.
      if (page < 50) setPage(page + 1);
    };
  }, [jsonParser, page, totalPages, worker]);

  useEffect(() => {
    if (!page) return;
    worker?.postMessage({ file, chunkSize, currentPage: page });
  }, [file, page, worker]);

  const showFileForm = !parsedJson && !isLoading;

  return (
    <main
      className={`bg-white flex w-screen h-full flex-col items-center${
        showFileForm ? " justify-center" : ""
      }`}
    >
      {parsedJson && (
        <JsonFileVisualizer name={(file as File).name} json={parsedJson} />
      )}
      {showFileForm && <FileLoader onValidJsonLoad={onSelectJsonFile} />}
      {isLoading && <span>Loading...</span>}
    </main>
  );
}

export default App;
