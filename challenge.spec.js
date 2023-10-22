import { describe, it } from "node:test";
import { RinhaParser } from "./parser.js";
import assert from "node:assert";

import verySmall from "./json-files/verysmall.json" assert { type: "json" };
import small from "./json-files/small.json" assert { type: "json" };
import alltypes from "./json-files/alltypes.json" assert { type: "json" };
import startwitharray from "./json-files/startwitharray.json" assert { type: "json" };

const files = [verySmall, small, alltypes, startwitharray];
const filesStr = files.map((file) => JSON.stringify(file).slice(0, 2_048));

describe("file parse", () => {
  it("parses verySmall.json", () => {
    assert.doesNotThrow(() => {
      new RinhaParser().parse(filesStr[0]);
    });
  });

  it("parses small.json", () => {
    assert.doesNotThrow(() => {
      new RinhaParser().parse(filesStr[1]);
    });
  });

  it("parses alltypes.json", () => {
    assert.doesNotThrow(() => {
      new RinhaParser().parse(filesStr[2]);
    });
  });

  it("parses startwitharray.json", () => {
    assert.doesNotThrow(() => {
      new RinhaParser().parse(filesStr[3]);
    });
  });
});
