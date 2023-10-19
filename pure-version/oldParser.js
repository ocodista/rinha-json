// === lineParser ===
const isBoolean = (value) =>
  value.trim() === "true" || value.trim() === "false";

const keyStyle = `color: #4E9590;
font-family: Inter;
font-size: 16px;
font-style: normal;
font-weight: 400;
line-height: 176.523%;`;

const arrayIndexStyle = `color: #BFBFBF;
font-family: Inter;
font-size: 16px;
font-style: normal;
font-weight: 400;
line-height: 176.523%;`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const arrayDelimiterStyle = `color: #F2CAB8;
font-family: Inter;
font-size: 16px;
font-style: normal;
font-weight: 700;
line-height: 176.523%;`;

const valueStyle = `color: #000;
font-family: Inter;
font-size: 16px;
font-style: normal;
font-weight: 400;
line-height: 176.523%;`;

const appendOutput = (
  key,
  value,
  arrayIndex,
  isArray,
  isValueNumeric,
  isValueBoolean,
) => {
  let output = "";
  if (isArray) {
    output += `<span style="${arrayIndexStyle}" aria-label="array_${arrayIndex}_index">${arrayIndex}: </span>`;
    output +=
      isValueNumeric || isValueBoolean
        ? `<span style="${valueStyle}" aria-label="array_${arrayIndex}_value">${value.trim()}</span>`
        : `<span style="${valueStyle}" aria-label="array_${arrayIndex}_value">${value.trim()}</span>`;
  } else {
    output += `<span style="${keyStyle}" aria-label="prop-${key.trim()}">${key.trim()}: </span>`;
    output +=
      isValueNumeric || isValueBoolean
        ? `<span style="${valueStyle}" aria-label="${value.trim()}">${value.trim()}</span>`
        : `<span style="${valueStyle}" aria-label=${value.trim()}>${value.trim()}</span>`;
  }
  return output;
};

const isNumeric = (value) => {
  const trimmedValue = value.trim();
  return (
    !isNaN(Number(trimmedValue)) &&
    !trimmedValue.startsWith('"') &&
    !trimmedValue.endsWith('"')
  );
};

const increaseDepthCharacters = ["{", "["];
const decreaseDepthCharacter = ["}", "]"];

export const lineParser = (str) => {
  let depth = 0;
  let key = "";
  let value = "";
  let isKey = true;
  let output = "";
  let isArray = false;
  let arrayIndex = 0;

  for (const char of str.trim()) {
    if (increaseDepthCharacters.includes(char)) {
      depth++;
      if (char === "[") {
        isArray = true;
        isKey = false;
      }
    } else if (decreaseDepthCharacter.includes(char)) {
      depth--;
      if (depth === 0 && (key || isArray) && value) {
        const isValueNumeric = isNumeric(value);
        const isValueBoolean = isBoolean(value);
        if (value.trim().startsWith("{") || value.trim().startsWith("[")) {
          value = lineParser(value.trim());
        }
        output += appendOutput(
          key,
          value,
          arrayIndex,
          isArray,
          isValueNumeric,
          isValueBoolean,
        );
        key = "";
        value = "";
        isKey = true;
      }
    } else if (char === ":") {
      isKey = false;
    } else if (char !== "," && char !== ":") {
      if (isKey) {
        if (char === '"') continue;
        key += char;
      } else {
        value += char;
      }
    } else if (char === "," && (isArray || isKey)) {
      if (isArray) {
        const isValueNumeric = isNumeric(value);
        const isValueBoolean = isBoolean(value);
        if (value.trim().startsWith("{") || value.trim().startsWith("[")) {
          value = lineParser(value.trim());
        }
        output += appendOutput(
          key,
          value,
          arrayIndex,
          isArray,
          isValueNumeric,
          isValueBoolean,
        );
        arrayIndex++;
      }
      value = "";
      if (isKey) {
        isKey = false;
      }
    }
  }

  return output;
};
// === end of lineParser ===
