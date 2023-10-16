/* eslint-disable no-case-declarations */
export const valueType = {
  key: "key",
  string: "string",
  notString: "notString",
};

export const htmlByType = {
  [valueType.key]: (key) => `
    <span class="json-key">${key}</span>
  `,
  [valueType.string]: (value) => `<span class="json-string">"${value}"</span>`,
  [valueType.notString]: (value) => `<span class="json-value">${value}</span>`,
};

const INVALID_JSON = "JSON is invalid.";
const STRING_INDICATOR = '"';
const KEY_END_INDICATOR = ":";
const ARRAY_START_INDICATOR = "[";
const PROP_SEPARATOR = ",";
const STARTING_JSON_REGEX = /[{[]/;
const STARTING_VALUE_REGEX = /("|t|f|[0-9]|n|{)/;
const OBJ_PROP_OR_END_REGEX = /[},]/;

export class RinhaParser {
  buffer = "";
  htmlTags = [];
  json = "";
  position = 0;

  construct() {}

  char() {
    return this.json[this.position];
  }

  readNextChar() {
    this.position++;
    if (this.position > this.json.length) throw new Error(INVALID_JSON);
    return this.char();
  }

  readUntil(char) {
    let readBuffer = this.char();
    let stop = false;
    do {
      readBuffer += this.readNextChar();
      const hasReachedChar = readBuffer.at(-1) === char;
      if (hasReachedChar) {
        // should stop
        const isEscaped = readBuffer.at(-2) === "\\";
        if (!isEscaped) stop = true;
      }
    } while (!stop);
    readBuffer = readBuffer.slice(0, -1);
    return readBuffer;
  }

  readKey() {
    this.expect(STRING_INDICATOR);
    let key = this.char();
    while (key.at(-1) !== STRING_INDICATOR) {
      key += this.readNextChar();
    }
    key = key.slice(0, -1); // remove last " from key
    this.expect(STRING_INDICATOR);
    return key;
  }

  readValue() {
    const valueStart = this.match(STARTING_VALUE_REGEX);
    let value = "",
      type = "string";
    switch (valueStart) {
      case "f":
        this.expect("alse");
        value = "false";
        type = valueType.notString;
        break;
      case "t":
        this.expect("rue");
        value = "true";
        type = valueType.notString;
        break;
      case "n":
        this.expect("ull");
        value = "null";
        type = valueType.notString;
        break;
      case '"':
        const strValue = this.readUntil(STRING_INDICATOR);
        this.expect(STRING_INDICATOR);
        value = strValue;
        type = valueType.string;
        break;
      case "{":
        // TODO: Parse nested object
        break;
      default:
        if (!isNaN(this.char())) {
          throw new Error(INVALID_JSON);
        }
        const number = this.readUntil(PROP_SEPARATOR);
        if (!isNaN(number)) throw new Error(INVALID_JSON);
        value = number;
        type = valueType.notString;
        break;
    }
    return { value, type };

    // expect value end, that can be ,]}
  }

  ignoreSpace() {
    while (this.char() === " " || this.char() === "\n") {
      this.readNextChar();
    }
  }

  expect(nextChars) {
    this.ignoreSpace();
    for (let i = 0; i < nextChars.length; i++) {
      const expected = nextChars[i];
      if (this.char() !== expected) {
        // TODO: uncomment this to debug
        //console.log({ char: this.char(), expected: nextChar });
        throw new Error(INVALID_JSON, { expected, char: this.char() });
      }
      this.readNextChar();
    }
  }

  match(expectedRegex) {
    let char = this.char();
    if (!expectedRegex.test(this.char())) {
      throw new Error(INVALID_JSON);
    }
    this.readNextChar();
    return char;
  }

  parseArray() {
    //this.expect(ARRAY_END_INDICATOR);
  }

  parseObject() {
    let hasNextProp = false;
    do {
      const key = this.readKey();
      this.htmlTags.push(htmlByType[valueType.key](key));
      this.expect(KEY_END_INDICATOR);
      const { type, value } = this.readValue();
      this.htmlTags.push(htmlByType[type](value));
      const endOrNewProp = this.match(OBJ_PROP_OR_END_REGEX);
      hasNextProp = endOrNewProp === PROP_SEPARATOR;
    } while (hasNextProp);
  }

  parse(str) {
    this.json = str;
    if (!str) throw new Error(INVALID_JSON);
    this.position = 0;
    const startToken = this.match(STARTING_JSON_REGEX);
    this.ignoreSpace();
    if (startToken === ARRAY_START_INDICATOR) {
      this.parseArray();
      return;
    }
    this.parseObject();
    return this.htmlTags;
  }
}
