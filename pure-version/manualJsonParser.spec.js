import { it, test, describe } from "node:test";
import assert from "node:assert";
import { RinhaParser, htmlByType, valueType } from "./manualJsonParser.js";

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

const jsonMocks = {
  array: {
    input: JSON.stringify([1, 2, 3]),
    output: [
      htmlByType[valueType.arrayStart](),
      htmlByType[valueType.arrayIndex](0),
      htmlByType[valueType.notString](1),
      htmlByType[valueType.arrayIndex](1),
      htmlByType[valueType.notString](2),
      htmlByType[valueType.arrayIndex](2),
      htmlByType[valueType.notString](3),
    ],
  },
  objectProp: {
    input: JSON.stringify({ a: { b: { c: "1", d: 2, e: true } } }),
    output: [
      htmlByType[valueType.objStart](),
      htmlByType[valueType.key]("a"),
      htmlByType[valueType.objStart](),
      htmlByType[valueType.key]("b"),
      htmlByType[valueType.objStart](),
      htmlByType[valueType.key]("c"),
      htmlByType[valueType.string]("1"),
      htmlByType[valueType.key]("d"),
      htmlByType[valueType.notString](2),
      htmlByType[valueType.key]("e"),
      htmlByType[valueType.notString](true),
    ],
  },
  boolean: {
    input: JSON.stringify({ isWorking: true }),
    output: [
      htmlByType[valueType.objStart](),
      htmlByType[valueType.key]("isWorking"),
      htmlByType[valueType.notString]("true"),
    ],
  },
  string: {
    input: JSON.stringify({ name: "Caio" }),
    output: [
      htmlByType[valueType.objStart](),
      htmlByType[valueType.key]("name"),
      htmlByType[valueType.string]("Caio"),
    ],
  },
  number: {
    input: JSON.stringify({ age: 25 }),
    output: [
      htmlByType[valueType.objStart](),
      htmlByType[valueType.key]("age"),
      htmlByType[valueType.notString](25),
    ],
  },
};

describe("read until", () => {
  const parser = new RinhaParser();
  parser.json = "{ abcdefg }";
  assert.equal(parser.readUntil("f"), "{ abcde");
  assert.equal(parser.char(), "f");
});

describe("expect", () => {
  const globalParser = new RinhaParser();
  globalParser.json = jsonMocks.string.input;
  globalParser.position = 0;

  test("increases position if token is found next", () => {
    globalParser.expect("{");
    assert.equal(globalParser.position, 1);
  });

  test("throws error if next character is not found", () => {
    assert.throws(() => {
      globalParser.expect("not :");
    });
  });
});

test.skip("save rest of string to persistance if json ends before closing key", () => {
  const incompleteJSON = '{"name":';
  const completion = ' "Caio"    }';
  const tempParser = new RinhaParser();
  const keyOutput = tempParser.parse(incompleteJSON);
  assert.equal(tempParser.checkpoint, 0);
  assert.equal(keyOutput[0], htmlByType[valueType.key]("name"));
  assert.equal(tempParser.garbage, '{"name":');
  assert.equal(tempParser.parse(completion).length, 2);
  assert.equal(tempParser.garbage, 0);
});

describe("checkpoint with object", () => {
  const incomplete = '{ "city": "João Pessoa", "info": { "temperature": ';
  //const completion = "40 } }";
  const parser = new RinhaParser();
  parser.parse(incomplete);
  it("defines checkpoint as the position of the last {", () => {
    const lastOpenArrayPosition = incomplete.lastIndexOf("{") + 1;
    assert.equal(parser.checkpoint, lastOpenArrayPosition);
  });

  // assert.doesNotThrow(() => parser.parse(completion));
  // assert.equal(parser.parse(completion).length, 5);
});

describe.skip("checkpoint with array", () => {
  test("set to last start of array", () => {
    const incomplete = '{ "rows": [ 1, ';
    const completion = "2, 3 ]}";
    const parser = new RinhaParser();
    parser.parse(incomplete);
    assert.equal(parser.garbage, "[ 1, ");
    assert.equal(parser.parse(completion).length, 6);
  });
});

Object.keys(jsonMocks).forEach((key) => {
  test(`parse JSON with ${key} prop`, () => {
    assert.doesNotThrow(() => {
      assert.deepEqual(parse(jsonMocks[key].input), jsonMocks[key].output);
    });
  });
});

const parseNew = (json) => {
  const result = new RinhaParser();
  result.parse(json);
  return result;
};

describe("nested props", () => {
  const jsonString = JSON.stringify({ a: { b: 1, c: { d: true } } });
  it("does not throws", () => {
    new RinhaParser().parse(jsonString);
  });

  it("increase depth at each {", () => {
    const currentParser = parseNew('{ "a": {');
    assert.equal(currentParser.depth, 2);
  });

  it("increase depth on [", () => {
    const currentParser = parseNew('{ "a": [');
    assert.equal(currentParser.depth, 2);
  });

  it("decrease depth at each }", () => {
    const parserDepth = new RinhaParser();
    parserDepth.parse('{ "a": { "b": 1 }');
    assert.equal(parserDepth.depth, 1);
  });

  it("decrease depth at each ]", () => {
    const parserDepth = new RinhaParser();
    parserDepth.parse('{ "a": [1]');
    assert.equal(parserDepth.depth, 1);
  });

  it("increase depth on { and [", () => {
    const parser = new RinhaParser();
    parser.parse('{ "a": [{ "b": [');
    assert.equal(parser.depth, 4);
  });

  it("returns right html tags for nested json object", () => {
    const nestedJson = { a: { b: 1 } };
    const parser = parseNew(JSON.stringify(nestedJson));
    assert.deepEqual(parser.htmlTags, [
      htmlByType[valueType.objStart](),
      htmlByType[valueType.key]("a"),
      htmlByType[valueType.objStart](),
      htmlByType[valueType.key]("b"),
      htmlByType[valueType.notString](1),
    ]);
  });

  it("returns right html tags for array prop");
});

// describe("json numeric prop");
// describe("json boolean prop");
// describe("json array prop");
// describe("json null prop");
// describe("json object prop");
