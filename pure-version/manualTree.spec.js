import { test } from "node:test";
import assert from "node:assert";
import { RinhaParser } from "./manualTree.js";

const parser = new RinhaParser();
test("throws error for invalid JSON", () => {
  assert.throws(() => parser.parse("}"));
  assert.throws(() => parser.parse("]"));
  assert.throws(() => parser.parse("a"));
  assert.throws(() => parser.parse("n"));
  assert.throws(() => parser.parse("1"));
});

test("does not throws for valid JSON", () => {
  assert.doesNotThrow(() => parser.parse("{}"));
});

test("does not throw with json array", () => {
  assert.doesNotThrow(() => parser.parse("[]"));
});
