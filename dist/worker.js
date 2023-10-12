/* eslint-disable no-undef */
importScripts("https://unpkg.com/oboe@2.1.4/dist/oboe-browser.min.js")

var offset = 0

onmessage = function ({ data }) {
  const { file, chunkSize, currentPage } = data
  const pages = Math.ceil(file.size / chunkSize)
  parseChunk({ currentPage, pages, chunkSize, file })
}

function parseChunk({ currentPage, pages, chunkSize, file }) {
  if (currentPage >= pages) {
    console.log("finished reading json!")
    return
  }

  const chunk = file.slice(offset, offset + chunkSize)
  const chunkText = new FileReaderSync().readAsText(chunk)
  const lastValidPropOffset = chunkText.lastIndexOf("}") + offset
  offset += chunkSize
  postMessage({ chunkText, lastValidPropOffset })
}