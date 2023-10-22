/* eslint-disable @typescript-eslint/no-var-requires */
import { RinhaParser } from "./parser.js";

const parser = new RinhaParser();
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

  console.time("read chunk");
  // Calculate the byte range to read
  const startByte = currentPage * chunkSize;
  const endByte = startByte + chunkSize;

  // Create a new Blob slice for the current "page"
  const chunk = file.slice(startByte, endByte);

  // Read the Blob slice asynchronously
  const reader = new FileReader();
  reader.onload = function () {
    const text = reader.result;
    console.timeEnd("read chunk");
    console.time("parse text");
    const html = parser.parse(text);
    console.timeEnd("parse text");
    postMessage({
      chunkText: text,
      treeHTML: html.join(""),
      lastValidPropOffset: text.lastIndexOf("}") + startByte,
    });
  };
  reader.readAsText(chunk);
}
