const isBoolean = (value: string) =>
  value.trim() === "true" || value.trim() === "false";

const appendOutput = (
  key: string,
  value: string,
  arrayIndex: number,
  isArray: boolean,
  isValueNumeric: boolean,
  isValueBoolean: boolean,
) => {
  let output = "";
  if (isArray) {
    output += `<span aria-label="array_${arrayIndex}_index">${arrayIndex}: </span>`;
    output +=
      isValueNumeric || isValueBoolean
        ? `<span aria-label="array_${arrayIndex}_value">${value.trim()}</span>`
        : `<span aria-label="array_${arrayIndex}_value">${value.trim()}</span>`;
  } else {
    output += `<span aria-label="prop-${key.trim()}">${key.trim()}: </span>`;
    output +=
      isValueNumeric || isValueBoolean
        ? `<span aria-label="${value.trim()}">${value.trim()}</span>`
        : `<span aria-label=${value.trim()}>${value.trim()}</span>`;
  }
  return output;
};

const isNumeric = (value: string) => {
  const trimmedValue = value.trim();
  return (
    !isNaN(Number(trimmedValue)) &&
    !trimmedValue.startsWith('"') &&
    !trimmedValue.endsWith('"')
  );
};

const increaseDepthCharacters = ["{", "["];
const decreaseDepthCharacter = ["}", "]"];

export const lineParser = (str: string) => {
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
