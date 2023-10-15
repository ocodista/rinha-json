export const keyHTML = (key) => `<span class="json-key">${key}</span>`;

const INVALID_JSON = "JSON is invalid.";

const ARRAY_START_INDICATOR = "[";
const ARRAY_END_INDICATOR = "]";
const STARTING_TOKEN = /[{[]/;
const OBJECT_END = "}";

export class RinhaParser {
  position = 0;
  char;
  buffer = "";
  json = "";

  construct() {}

  readNextChar() {
    this.position++;
    this.char = this.json[this.position];
  }

  expect(nextChars) {
    for (let i = 0; i < nextChars.length; i++) {
      const nextChar = nextChars[i];
      if (this.char !== nextChar) {
        throw new Error(INVALID_JSON);
      }
      this.readNextChar();
    }
  }

  match(expectedRegex) {
    let char = this.char;
    if (!expectedRegex.test(this.char)) {
      throw new Error(INVALID_JSON);
    }
    this.readNextChar();
    return char;
  }

  parse(str) {
    this.json = str;
    if (!str) throw new Error(INVALID_JSON);
    this.char = this.json[0];
    const startToken = this.match(STARTING_TOKEN);
    if (startToken === ARRAY_START_INDICATOR) {
      //handle array
      console.log("is array", this.char, this.position);
      this.expect(ARRAY_END_INDICATOR);
      return;
    }

    this.expect(OBJECT_END);
  }
}
