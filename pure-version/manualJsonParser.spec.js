import { test, describe } from "node:test";
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
  boolean: {
    input: JSON.stringify({ isWorking: true }),
    output: [
      htmlByType[valueType.key]("isWorking"),
      htmlByType[valueType.notString]("true"),
    ],
  },
  string: {
    input: JSON.stringify({ name: "Caio" }),
    output: [
      htmlByType[valueType.key]("name"),
      htmlByType[valueType.string]("Caio"),
    ],
  },
};

describe("expect", () => {
  const parser = new RinhaParser();
  parser.json = jsonMocks.string.input;
  parser.position = 0;

  test("increases position if token is found next", () => {
    parser.expect("{");
    assert.equal(parser.position, 1);
  });

  test("works if pass only key, without spaces", () => {
    parser.expect('"name"');
    assert.equal(parser.position, 7);
  });

  test("throws error if next character is not found", () => {
    assert.throws(() => {
      parser.expect("not :");
    });
  });
});

test.todo(
  "save rest of string to persistance if json ends before closing key",
  () => {
    const incompleteJSON = '{"name":';
    const completion = ' "Caio"    }';
    const tempParser = new RinhaParser();
    const keyOutput = tempParser.parse(incompleteJSON);
    assert.equal(tempParser.checkpoint, 0);
    assert.equal(keyOutput[0], htmlByType[valueType.key]("name"));
    assert.equal(tempParser.garbage, '{"name":');
    assert.equal(tempParser.parse(completion).length, 2);
    assert.equal(tempParser.garbage, 0);
  },
);

describe.only("checkpoint", () => {
  test.only("set checkpoint to last beginning of object", () => {
    const incomplete = '{ "city": "João Pessoa", "info": { "temperature": ';
    const completion = "40 } }";
    const parser = new RinhaParser();
    parser.parse(incomplete);
    assert.equal(parser.garbage, '{{ "temperature": ');
    assert.equal(parser.checkpoint, 32);
    assert.doesNotThrow(() => parser.parse(completion));
    assert.equal(parser.parse(completion).length, 5);
  });
  test.only("set to last start of array", () => {
    const incomplete = '{ "rows": [ 1, ';
    const completion = "2, 3 ]}";
    const parser = new RinhaParser();
    parser.parse(incomplete);
    assert.equal(parser.garbage, "[ 1, ");
    assert.equal(parser.parse(completion).length, 6);
  });
});

test("parse all jsonMocks", () => {
  Object.keys(jsonMocks).forEach((key) => {
    assert.doesNotThrow(() => {
      assert.deepEqual(parse(jsonMocks[key].input), jsonMocks[key].output);
    });
  });
});

describe("json string prop", () => {
  const result = parse(jsonMocks.string.input);
  test("does not throws", () => {
    assert.doesNotThrow(() => {
      parse(jsonMocks.string.input);
    });
  });
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

describe("json number prop", () => {});
// describe("json numeric prop");
// describe("json boolean prop");
// describe("json array prop");
// describe("json null prop");
// describe("json object prop");
