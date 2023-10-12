// worker.js
onmessage = (event) => {
  console.time('parse in worker')
  postMessage(JSON.parse(event.data))
  console.timeEnd('parse in worker')
};
