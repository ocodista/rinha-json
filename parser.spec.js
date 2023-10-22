import { it, test, describe } from "node:test";
import assert from "node:assert";
import { RinhaParser, valueType } from "./parser.js";

const parser = new RinhaParser();
const testData = {
  array: {
    input: JSON.stringify([1, 2, 3]),
    output: [
      parser.html[valueType.arrayStart],
      parser.html[valueType.arrayIndex](0),
      parser.html[valueType.notString](1),
      parser.html[valueType.arrayIndex](1),
      parser.html[valueType.notString](2),
      parser.html[valueType.arrayIndex](2),
      parser.html[valueType.notString](3),
      parser.html[valueType.arrayEnd],
    ],
  },
  startsWithArray: {
    input: JSON.stringify([1, 2, 3]),
    output: [
      parser.html[valueType.arrayStart],
      parser.html[valueType.arrayIndex](0),
      parser.html[valueType.notString](1),
      parser.html[valueType.arrayIndex](1),
      parser.html[valueType.notString](2),
      parser.html[valueType.arrayIndex](2),
      parser.html[valueType.notString](3),
      parser.html[valueType.arrayEnd],
    ],
  },
  nestedObject: {
    input: JSON.stringify({ a: { b: { c: "1", d: 2, e: true } } }),
    output: [
      parser.html[valueType.objStart],
      parser.html[valueType.key]("a"),
      parser.html[valueType.objStart],
      parser.html[valueType.key]("b"),
      parser.html[valueType.objStart],
      parser.html[valueType.key]("c"),
      parser.html[valueType.string]("1"),
      parser.html[valueType.key]("d"),
      parser.html[valueType.notString](2),
      parser.html[valueType.key]("e"),
      parser.html[valueType.notString](true),
      parser.html[valueType.objEnd],
      parser.html[valueType.objEnd],
      parser.html[valueType.objEnd],
    ],
  },
  boolean: {
    input: JSON.stringify({ isWorking: true }),
    output: [
      parser.html[valueType.objStart],
      parser.html[valueType.key]("isWorking"),
      parser.html[valueType.notString]("true"),
      parser.html[valueType.objEnd],
    ],
  },
  string: {
    input: JSON.stringify({ name: "Caio" }),
    output: [
      parser.html[valueType.objStart],
      parser.html[valueType.key]("name"),
      parser.html[valueType.string]("Caio"),
      parser.html[valueType.objEnd],
    ],
  },
  number: {
    input: JSON.stringify({ age: 25 }),
    output: [
      parser.html[valueType.objStart],
      parser.html[valueType.key]("age"),
      parser.html[valueType.notString](25),
      parser.html[valueType.objEnd],
    ],
  },
};
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

describe("read until", () => {
  const parser = new RinhaParser();
  parser.json = "{ abcdefg }";
  assert.equal(parser.readUntil("f"), "{ abcde");
  assert.equal(parser.char(), "f");
});

describe("expect", () => {
  const globalParser = new RinhaParser();
  globalParser.json = testData.string.input;
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
  assert.equal(keyOutput[0], parser.html[valueType.key]("name"));
  assert.equal(tempParser.garbage, '{"name":');
  assert.equal(tempParser.parse(completion).length, 2);
  assert.equal(tempParser.garbage, 0);
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

describe("checkpoint with object", () => {
  const incomplete = '{ "city": "João Pessoa", "info": { "temperature": ';
  const completion = "40 } }";
  const parser = new RinhaParser();
  it("defines checkpoint as the position of the last {", () => {
    parser.parse(incomplete);
    const lastOpenArrayPosition = incomplete.lastIndexOf("{") + 1;
    assert.equal(parser.checkpoint, lastOpenArrayPosition);
  });

  it.skip("parses sequentially", () => {
    parser.parse(incomplete);
    assert.doesNotThrow(() => parser.parse(completion));
  });
  // assert.equal(parser.parse(completion).length, 5);
});

Object.keys(testData).forEach((key) => {
  test.skip(`parse JSON with ${key} prop`, () => {
    assert.doesNotThrow(() => {
      assert.deepEqual(parse(testData[key].input), testData[key].output);
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

  it.skip("returns right html tags for nested json object", () => {
    const nestedJson = { a: { b: 1 } };
    const parser = parseNew(JSON.stringify(nestedJson));
    assert.deepEqual(parser.htmlTags, [
      parser.html[valueType.objStart],
      parser.html[valueType.key]("a"),
      parser.html[valueType.objStart],
      parser.html[valueType.key]("b"),
      parser.html[valueType.notString](1),
      parser.html[valueType.objEnd],
      parser.html[valueType.objEnd],
    ]);
  });

  it.skip("returns right html tags for array prop");
});
