/* eslint-disable @typescript-eslint/no-var-requires */
import { lineParser } from "./parser.js";
import { jsonToHTML } from "./jsonTree.js";

onmessage = function ({ data }) {
  const { file, chunkSize, currentPage } = data;
  const pages = Math.ceil(file.size / chunkSize);
  parseChunk({ currentPage, pages, chunkSize, file });
};

function parseChunk({ currentPage, pages, chunkSize, file }) {
  if (currentPage >= pages) {
    console.log("finished reading json!");
    return;
  }

  // Calculate the byte range to read
  const startByte = currentPage * chunkSize;
  const endByte = startByte + chunkSize;

  // Create a new Blob slice for the current "page"
  const chunk = file.slice(startByte, endByte);

  // Read the Blob slice asynchronously
  const reader = new FileReader();
  reader.onload = function () {
    const text = reader.result;
    postMessage({
      chunkText: text,
      treeHTML: jsonToHTML(text),
      lastValidPropOffset: text.lastIndexOf("}") + startByte,
    });
  };
  reader.readAsText(chunk);
}
