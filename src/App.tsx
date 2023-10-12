import React, { useEffect, useState } from 'react'
import { FileSelector } from './FileSelector'
import { JsonVisualizer } from './JsonVisualizer';

function App() {
  const [isLoading, setLoading] = useState(false)
  const [worker, setWorker] = useState<Worker | undefined>(undefined);
  const [jsonFileProps, setJson] = useState(undefined)

  const onValidJsonLoad = (file: File) => {
    console.log("valid file", file)
    const reader = new FileReader();
    reader.onloadstart = () => setLoading(true)
    reader.onload = () => {
      const parsed = JSON.parse(reader.result as string)
      setJson(parsed)
      console.log("finished", parsed)
      setLoading(false)
    };
    reader.readAsText(file);
  }


  useEffect(() => {
    const workerInstance = new Worker('./worker.js');
    setWorker(workerInstance);
    return () => workerInstance.terminate();
  }, []);

  useEffect(() => {
    if (worker) {
      worker.onmessage = (obj) => {
        console.log("worker returned", obj.data)
      };
    }
  }, [worker]);

  if (isLoading)
    return <span>Is Loading...</span>

  if (jsonFileProps) {
    return <JsonVisualizer json={jsonFileProps} />
  }

  return (
    <>
      {isLoading ? <span>loading...</span> :
        <FileSelector onValidJsonLoad={onValidJsonLoad} />
      }
    </>
  )
}

export default App
