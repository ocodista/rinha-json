var worker = null,
  elements = {
    errorMessage: null,
    fileSelector: null,
    jsonTree: null,
  },
  state = {
    fileName: null,
  };

const chunkSize = 1000;

const getValidFile = (files) => {
  if (!files?.length) return;
  const file = files[0];
  if (file.type !== "application/json") {
    elements.errorMessage.textContent =
      "Invalid file. Please load a valid JSON file.";
    return;
  }
  return file;
};

const hide = (el) => (el.style.display = "none");

const treeTitle = () => `<h1 style="margin: 0">${state.fileName}</h1>`;

document.addEventListener("DOMContentLoaded", () => {
  worker = new Worker("./worker.js", { type: "module" });
  elements.errorMessage = document.getElementById("error-message");
  elements.fileSelector = document.getElementById("file-selector");
  elements.jsonTree = document.getElementById("json-tree");

  worker.onmessage = ({ data: { treeHTML } }) => {
    console.log(treeHTML);
    hide(elements.fileSelector);
    const filePageHTML = `
      <section id="tree-page" 
        style="
          display: flex;
          flex-direction: column;
          padding-top: 24px;
          max-width: 638px; 
          margin-left: auto;
          margin-right: auto;
          gap: 10px;
        "
      >
        ${treeTitle()}
        <main id="tree" style="display: flex; flex-direction: column;">
          ${treeHTML}
        </main>
      </section>
    `;
    elements.jsonTree.insertAdjacentHTML("beforeend", filePageHTML);
  };
  const fileUpload = document.getElementById("file-upload");

  fileUpload.addEventListener("change", function (event) {
    const file = getValidFile(event.target.files);
    state.fileName = file.name;
    readAndParseOnWorker(file);
  });
});

function readAndParseOnWorker(file) {
  worker.postMessage({ file, chunkSize, currentPage: 0 });
}
