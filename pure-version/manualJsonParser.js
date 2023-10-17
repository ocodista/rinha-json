/* eslint-disable no-case-declarations */
export const valueType = {
  key: "key",
  string: "string",
  notString: "notString",
  arrayStart: "arrayStart",
  objStart: "objStart",
};

export const htmlByType = {
  [valueType.key]: (key) => `
    <span class="json-key">${key}</span>
  `,
  [valueType.string]: (value) => `<span class="json-string">"${value}"</span>`,
  [valueType.notString]: (value) => `<span class="json-value">${value}</span>`,
  [valueType.arrayStart]: () => `<span class="array-start">[</span>`,
};

const INVALID_JSON = "JSON is invalid.";
const STRING_INDICATOR = '"';
const KEY_END_INDICATOR = ":";
const ARRAY_START = "[";
const ARRAY_END = "]";
const ARRAY_END_OR_COMMA = "],";
const PROP_SEPARATOR = ",";
const JSON_START_OPTIONS = "{[";
const VALUE_START_OPTIONS = '"tfn{[0123456789';
const OBJ_END_OR_COMMA = "},";
const OBJ_START = "{";
const OBJ_END = "}";

export class RinhaParser {
  buffer = "";
  checkpoint = 0;
  depth = 0;
  htmlTags = [];
  json = "";
  position = 0;
  #valueReaders = {
    f: () => {
      this.expect("false");
      return { value: "false", type: valueType.notString };
    },
    t: () => {
      this.expect("true");
      return { value: "true", type: valueType.notString };
    },
    n: () => {
      this.expect("null");
      return { value: "null", type: valueType.notString };
    },
    [STRING_INDICATOR]: () => {
      this.expect(STRING_INDICATOR);
      const strValue = this.readUntil(STRING_INDICATOR);
      this.expect(STRING_INDICATOR);
      return { value: strValue, type: valueType.string };
    },
    [OBJ_START]: () => {
      this.parseObject();
    },
    [ARRAY_START]: () => {
      this.parseArray();
    },
    default: () => {
      if (isNaN(this.char())) {
        throw new Error(
          "Invalid number at: " +
            this.position +
            ": " +
            this.json[this.position],
        );
      }

      const options = PROP_SEPARATOR + OBJ_END + ARRAY_END;
      let number = this.char();
      this.readNextChar();
      number += this.readUntil(options);

      if (isNaN(number)) throw new Error("Invalid number at: " + this.position);

      return { value: number, type: valueType.notString };
    },
  };

  construct() {}

  char() {
    return this.json[this.position];
  }

  readNextChar() {
    this.position++;
    if (this.position > this.json.length) throw new Error("Incomplete JSON!");
    return this.char();
  }

  readUntil(charOptions) {
    if (charOptions.indexOf(this.char()) > -1) return "";
    let readBuffer = this.char();
    let stop = false,
      head = "";
    do {
      head = this.readNextChar();
      if (charOptions.indexOf(head) > -1) {
        const isEscaped = readBuffer.at(-1) === "\\";
        if (!isEscaped) {
          stop = true;
          break;
        }
      }
      readBuffer += head;
    } while (!stop);
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
    const firstChar = this.matchStr(VALUE_START_OPTIONS);
    const handler =
      this.#valueReaders[firstChar] || this.#valueReaders["default"];
    const result = handler();
    if (result) {
      this.htmlTags.push(htmlByType[result.type](result.value));
    }
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
        //console.log({ char: this.char(), expected });
        throw new Error("Expected " + expected + ", received " + this.char());
      }
      this.readNextChar();
    }
  }

  matchStr(expectedStr) {
    let char = this.char();
    if (expectedStr.indexOf(char) === -1) {
      throw new Error(`Did not match ${expectedStr}, current: ` + char);
    }
    return char;
  }

  parseArray() {
    this.expect(ARRAY_START);
    this.depth++;
    this.htmlTags.push(htmlByType[valueType.arrayStart]());
    this.checkpoint = this.position;
    let endOrComma;
    do {
      this.readValue();
      endOrComma = this.matchStr(ARRAY_END_OR_COMMA);
    } while (endOrComma !== ARRAY_END);
    this.expect(ARRAY_END);
    this.depth--;
  }

  parseObject() {
    this.expect(OBJ_START);
    this.depth++;
    this.checkpoint = this.position;
    let endToken = "";
    do {
      const key = this.readKey();
      this.htmlTags.push(htmlByType[valueType.key](key));
      this.ignoreSpace();
      this.expect(KEY_END_INDICATOR);
      this.ignoreSpace();
      this.readValue();
      endToken = this.matchStr(OBJ_END_OR_COMMA);
      this.readNextChar();
    } while (endToken === PROP_SEPARATOR);
    this.depth--;
  }

  parse(str) {
    if (!str) throw new Error(INVALID_JSON);
    this.json = str;
    this.position = 0;
    try {
      const startToken = this.matchStr(JSON_START_OPTIONS);
      this.ignoreSpace();
      if (startToken === OBJ_START) {
        this.parseObject();
      } else {
        this.parseArray();
      }
    } catch (err) {
      if (this.position < this.json.length) throw err;
    }
    return this.htmlTags;
  }
}
