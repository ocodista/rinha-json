export const valueType = {
  key: "key",
  string: "string",
  notString: "notString",
  arrayStart: "arrayStart",
  arrayEnd: "arrayEnd",
  arrayIndex: "arrayIndex",
  objStart: "objStart",
  objEnd: "objEnd",
};

const ARRAY_END = "]";
const ARRAY_END_OR_COMMA = "],";
const ARRAY_OBJ_START = "[{";
const ARRAY_START = "[";
const COMMA = ",";
const INVALID_JSON = "JSON is invalid.";
const KEY_VALUE = ":";
const OBJ_END = "}";
const OBJ_END_OR_COMMA = "},";
const OBJ_START = "{";
const QUOTE = '"';
const VALUE_START = '"tfn{[0123456789';

export class RinhaParser {
  buffer = "";
  checkpoint = 0;
  depth = 0;
  htmlTags = [];
  json = "";
  position = 0;
  #arrayBoundariesCss = `color: #F2CAB8; margin-left: ${this.depth * 8}px`;
  #arrayIndexCss = `color: #BFBFBF; margin-left: ${this.depth * 8}px`;
  #keycss = `color: #4E9590; margin-left: ${this.depth * 8}px`;
  #stringCss = `color: #000; margin-left: ${this.depth * 8}px`;
  #objCss = `margin-left: ${this.depth * 8}px`;
  html = {
    [valueType.key]: (key) => `
      <span style="${this.#keycss}">${key}: </span>
    `,
    [valueType.string]: (value) =>
      `<span style="${this.#stringCss}">"${value}"</span>`,
    [valueType.notString]: (value) =>
      `<span style="${this.#stringCss}">${value}</span>`,
    [valueType.arrayStart]: `<span style="${
      this.#arrayBoundariesCss
    }">[</span>`,
    [valueType.arrayEnd]: `<span style="${this.#arrayBoundariesCss}">]</span>`,
    [valueType.arrayIndex]: (index) =>
      `<span style="${this.#arrayIndexCss}">${index}: </span>`,
    [valueType.objStart]: `<span style="${this.#objCss}">{</span>`,
    [valueType.objEnd]: `<span style="${this.#objCss}">}</span>`,
  };
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
    [QUOTE]: () => {
      this.expect(QUOTE);
      const strValue = this.readUntil(QUOTE);
      this.expect(QUOTE);
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

      const options = COMMA + OBJ_END + ARRAY_END;
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
    this.expect(QUOTE);
    this.key = this.char();
    while (this.key.at(-1) !== QUOTE) {
      this.key += this.readNextChar();
    }
    this.key = this.key.slice(0, -1);
    this.expect(QUOTE);
    this.ignoreSpace();
  }

  readValue() {
    this.ignoreSpace();
    const firstChar = this.matchStr(VALUE_START);
    const key = this.key;
    const handler =
      this.#valueReaders[firstChar] || this.#valueReaders["default"];

    if (firstChar === OBJ_START) {
      this.htmlTags.push(this.html[valueType.key](key));
    }

    const result = handler();
    if (result) {
      this.htmlTags.push(
        `<div style=\"display: flex; gap: 8px\">${this.html[valueType.key](
          this.key,
        )}${this.html[result.type](result.value)}</div>`,
      );
    }
    this.ignoreSpace();
  }

  ignoreSpace() {
    const spaceChars = "\n \t";
    while (spaceChars.indexOf(this.char()) > -1) {
      this.readNextChar();
    }
  }

  expect(nextChars) {
    this.ignoreSpace();
    for (let i = 0; i < nextChars.length; i++) {
      const expected = nextChars[i];
      if (this.char() !== expected) {
        // TODO: uncomment this to debug
        // console.log({ char: this.char(), expected });
        throw new Error(
          "Expected " +
            expected +
            " received " +
            this.char() +
            "\nposition: " +
            this.position,
        );
      }
      this.readNextChar();
    }
  }

  matchStr(expectedStr) {
    let char = this.char();
    if (expectedStr.indexOf(char) === -1) {
      throw new Error(`Did not match ${expectedStr} current: ` + char);
    }
    return char;
  }

  parseArray() {
    this.expect(ARRAY_START);
    this.depth++;
    this.htmlTags.push(this.html[valueType.arrayStart]);
    this.checkpoint = this.position;
    let endOrComma,
      index = 0;
    do {
      this.htmlTags.push(this.html[valueType.arrayIndex](index++));
      this.readValue();
      endOrComma = this.matchStr(ARRAY_END_OR_COMMA);
      if (endOrComma === ",") {
        this.expect(",");
      }
    } while (endOrComma !== ARRAY_END);
    this.expect(ARRAY_END);
    this.depth--;
    this.htmlTags.push(this.html[valueType.arrayEnd]);
  }

  openObject() {
    this.expect(OBJ_START);
    this.htmlTags.push(this.html[valueType.objStart]);
    this.depth++;
    this.checkpoint = this.position;
  }

  closeObject() {
    this.depth--;
    this.htmlTags.push(this.html[valueType.objEnd]);
  }

  parseObject() {
    this.openObject();
    let endToken = "";
    do {
      this.readKey();
      this.expect(KEY_VALUE);
      this.readValue();
      endToken = this.matchStr(OBJ_END_OR_COMMA);
      this.expect(endToken);
    } while (endToken === COMMA);
    this.closeObject();
  }

  parse(str) {
    if (!str) throw new Error(INVALID_JSON);
    this.json = str;
    this.position = 0;
    try {
      const firstToken = this.matchStr(ARRAY_OBJ_START);
      this.ignoreSpace();
      if (firstToken === OBJ_START) {
        this.parseObject();
      } else {
        this.parseArray();
      }
    } catch (err) {
      if (this.position < this.json.length) {
        throw err;
      }
    }
    return this.htmlTags;
  }
}
