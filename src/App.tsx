import { useEffect, useState } from 'react'
import { FileSelector } from './FileSelector'
import { JsonFileVisualizer } from './JsonVisualizer';
import { JSONParser } from '@streamparser/json';

const chunkSize = 500;

function App() {
  const [x, setX] = useState<{ name: string, file: File | undefined }>({
    name: "",
    file: undefined
  })
  const [isLoading, setLoading] = useState(false)
  const [worker, setWorker] = useState<Worker | undefined>(undefined);
  const [parsedJson, setJson] = useState<object | undefined>(undefined)
  const [page, setPage] = useState(0)
  const [jsonParser, setParser] = useState<JSONParser | null>(null)

  const onSelectJsonFile = (file: File) => {
    setX({ name: file.name, file: file })
    if (!worker) throw new Error("Worker hasn't loaded yet...")
    worker?.postMessage({ file, chunkSize, currentPage: 0 })
  }

  useEffect(() => {
    const parser = new JSONParser();
    parser.onValue = (data) => {
      const { value, key, stack } = data
      console.log({ data })
      // if is object, the key is undefined
      // is is array, the key is not undefined and the stack, parent and value must be taken care off
      if (!key) {
        setJson(value as object)
      } else
        setJson(stack)
    };
    setParser(parser)
    const workerInstance = new Worker('./worker.js');
    setWorker(workerInstance);
    return () => workerInstance.terminate();
  }, []);

  useEffect(() => {
    if (!worker) return
    worker.onmessage = ({ data: { chunkText } }) => {
      if (!chunkText) {
        setLoading(false)
        return
      }
      jsonParser?.write(chunkText)
      // TODO: Increase page on scroll bottom.
      if (page < 5)
        setPage(page + 1)
    };
  }, [jsonParser, page, worker]);

  useEffect(() => {
    if (!page) return
    worker?.postMessage({ file: x.file, chunkSize, currentPage: page })
  }, [page, worker, x])

  if (isLoading)
    return <span>Is Loading...</span>

  if (parsedJson) {
    return <JsonFileVisualizer name={x.name} json={parsedJson} />
  }

  return (
    <main className="bg-white flex w-screen h-full flex-col justify-center items-center">
      {isLoading ? <span>loading...</span> :
        <FileSelector onValidJsonLoad={onSelectJsonFile} />
      }
    </main>
  )
}

export default App
