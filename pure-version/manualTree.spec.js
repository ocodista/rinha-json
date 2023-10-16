import { test, describe } from "node:test";
import assert from "node:assert";
import { RinhaParser, htmlByType, valueType } from "./manualTree.js";

const parse = (str) => new RinhaParser().parse(str);

describe("JSON Start", () => {
  test("throws error for invalid JSON start", () => {
    assert.throws(() => parse("}"));
    assert.throws(() => parse("]"));
    assert.throws(() => parse("a"));
    assert.throws(() => parse("n"));
    assert.throws(() => parse("1"));
  });

  test("does not throw for valid JSON array start", () => {
    assert.doesNotThrow(() => parse("["));
  });
});

describe("expect", () => {
  const parser = new RinhaParser();
  parser.json = '{ "name": "Caio Borghi" }';
  parser.position = 0;

  test("increases position if token is found next", () => {
    parser.expect("{");
    assert.equal(parser.position, 1);
  });

  test("works if pass only key, without spaces", () => {
    parser.expect('"name"');
    assert.equal(parser.position, 8);
  });

  test("throws error if next character is not found", () => {
    assert.throws(() => {
      parser.expect("not :");
    });
  });
});

describe("read key", () => {
  test.todo("throws if key is malformed");
  test.todo("returns key if valid json");
  test.todo(
    "save rest of string to persistance if json ends before closing key",
  );
});

describe("json string prop", () => {
  const json = JSON.stringify({
    name: "Caio",
  });
  test("does not throws", () => {
    assert.doesNotThrow(() => {
      parse(json);
    });
  });
  const result = parse(json);
  test("returns two html tags (key and value)", () => {
    assert.equal(result.length, 2);
  });
  test("returns key html first", () => {
    assert.equal(result[0], htmlByType[valueType.key]("name"));
  });
  test("returns string html second", () => {
    assert.equal(result[1], htmlByType[valueType.string]("Caio"));
  });
});

// describe("json numeric prop");
// describe("json boolean prop");
// describe("json array prop");
// describe("json null prop");
// describe("json object prop");
