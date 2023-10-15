const isStartOfObject = (char) => char === "{";
const isEndOfObject = (char) => char === "}";
const isStartOfArray = (char) => char === "[";
const isEndOfArray = (char) => char === "]";
const isComma = (char) => char === ",";
const isColon = (char) => char === ":";

const jsonProp = (buffer) => {
  return `<span class="json-prop">"${buffer.trim()}"</span>: `;
};

const jsonObject = (buffer) => {
  return `<div class="json-object">${buffer}</div>`;
};

const jsonArray = (buffer, arrayIndex = null) => {
  if (arrayIndex !== null) {
    return `<li><span class="array-index">${arrayIndex}:</span> ${buffer}</li>`;
  } else {
    return `<span class="array-indicator">[</span><ul class="json-array">${buffer}</ul><span class="array-indicator">]</span>`;
  }
};

export const jsonToHTML = (str) => {
  let html = "";
  let isArray = false;
  let arrayIndex = 0;
  let isKey = true;
  let buffer = "";

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (isStartOfObject(char)) {
      if (isArray) {
        html += jsonObject("");
      } else {
        html += jsonObject("");
      }
    } else if (isEndOfObject(char)) {
      if (buffer.trim().length) {
        html += isKey ? jsonProp(buffer) : jsonToHTML(buffer);
        buffer = "";
      }
      html += `</div>`;
    } else if (isStartOfArray(char)) {
      isArray = true;
      arrayIndex = 0;
      html += jsonArray("");
    } else if (isEndOfArray(char)) {
      if (buffer.trim().length) {
        html += jsonArray(jsonToHTML(buffer), arrayIndex);
        buffer = "";
      }
      arrayIndex = 0;
      html += `</ul><span class="array-indicator">]</span>`;
      isArray = false;
    } else if (isComma(char) && !isArray) {
      html += isKey ? jsonProp(buffer) : jsonToHTML(buffer);
      buffer = "";
    } else if (isComma(char) && isArray) {
      html += jsonArray(jsonToHTML(buffer), arrayIndex);
      buffer = "";
      arrayIndex++;
    } else if (isColon(char) && !isArray) {
      isKey = false;
      buffer = "";
    } else {
      buffer += char;
    }

    if (i === str.length - 1 && buffer.trim().length) {
      html += isKey ? jsonProp(buffer) : jsonToHTML(buffer);
    }
  }

  return html;
};
