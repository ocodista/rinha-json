import { lineParser } from "../lineParser";

describe("line parser", () => {
  it("converts simple key: string value:string json to prop + str-value span html", () => {
    expect(lineParser(`{ "hello": "friend" }`)).toBe(
      `<span aria-label="prop-hello">hello: </span><span aria-label="friend">"friend"</span>`,
    );
  });

  it("converts simple key: string value:number json to prop + number-value span html", () => {
    expect(lineParser(`{ "hello": 2 }`)).toBe(
      `<span aria-label="prop-hello">hello: </span><span aria-label="2">2</span>`,
    );
  });

  it("converts array json into array html", () => {
    expect(lineParser(`["1", "2", "3"]`)).toBe(
      `<span aria-label="array_0_index">0: </span><span aria-label="array_0_value">"1"</span><span aria-label="array_1_index">1: </span><span aria-label="array_1_value">"2"</span><span aria-label="array_2_index">2: </span><span aria-label="array_2_value">"3"</span>`,
    );
  });

  it("converts key:string value:bool to prop + boolean-value span html", () => {
    expect(lineParser(`{ "isOK": true }`)).toBe(
      `<span aria-label="prop-isOK">isOK: </span><span aria-label="true">true</span>`,
    );
  });
});
