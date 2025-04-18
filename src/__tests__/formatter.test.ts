import { expect, test, describe, beforeEach, afterEach } from "bun:test";
import { removeForbiddenCharacters, removeForbiddenPrefixes } from "../formatter.ts";

import { config } from "../configuration";
// Mock config for testing
const mockConfig = {
  forbiddenCharacters: ["#", "@", "&"],
  unifiedSeparator: "-",
  forbiddenPrefixes: ["The", "Torrenting.com -"]
};

// Store original config
let originalConfig = config;

describe("removeForbiddenPrefixes", () => {
  test("removes exact forbidden prefix", () => {
    const input = "the-example-title";
    expect(removeForbiddenPrefixes(input, mockConfig.forbiddenPrefixes, mockConfig.unifiedSeparator)).toBe("example-title");
  });

  test("removes case-insensitive forbidden prefix", () => {
    const input = "The-example-title";
    expect(removeForbiddenPrefixes(input, mockConfig.forbiddenPrefixes, mockConfig.unifiedSeparator)).toBe("example-title");
  });

  test("does not remove prefix if not at the start", () => {
    const input = "example-the-title";
    expect(removeForbiddenPrefixes(input, mockConfig.forbiddenPrefixes, mockConfig.unifiedSeparator)).toBe("example-the-title");
  });

  test("remove a prefix and `the`", () => {
    const input = "torrenting.com --the-example-title";
    expect(removeForbiddenPrefixes(input, mockConfig.forbiddenPrefixes, mockConfig.unifiedSeparator)).toBe("example-title");
  });

  test("removes the first matching prefix from multiple options", () => {
    const input = "torrenting.com -example-title";
    expect(removeForbiddenPrefixes(input, mockConfig.forbiddenPrefixes, mockConfig.unifiedSeparator)).toBe("example-title");
  });

  test("returns original string if no prefixes match", () => {
    const input = "example-title";
    expect(removeForbiddenPrefixes(input, mockConfig.forbiddenPrefixes, mockConfig.unifiedSeparator)).toBe("example-title");
  });

  test("handles empty string input", () => {
    const input = "";
    expect(removeForbiddenPrefixes(input, mockConfig.forbiddenPrefixes, mockConfig.unifiedSeparator)).toBe("");
  });

  test("removes prefix if input is exactly the prefix", () => {
    const input = "The";
    expect(removeForbiddenPrefixes(input, mockConfig.forbiddenPrefixes, mockConfig.unifiedSeparator)).toBe("");
  });
})
describe("removeForbiddenCharacters", () => {
  /*  beforeEach(() => {
      // Save original config if it exists
      if (global.config) {
        originalConfig = { ...global.config };
      }
  
      // Set mock config for tests
      global.config = mockConfig;
    });
  
    afterEach(() => {
      // Restore original config if it existed
      if (originalConfig) {
        global.config = originalConfig;
      } else {
        delete global.config;
      }
    });*/

  test("removes forbidden characters", () => {
    const input = "Hello#World@Example&Test";
    const expected = "HelloWorldExampleTest";
    expect(removeForbiddenCharacters(input, mockConfig.forbiddenCharacters, mockConfig.unifiedSeparator)).toBe(expected);
  });

  test("removes leading separators", () => {
    const input = "---HelloWorld";
    const expected = "HelloWorld";
    expect(removeForbiddenCharacters(input, mockConfig.forbiddenCharacters, mockConfig.unifiedSeparator)).toBe(expected);
  });

  test("removes trailing separators", () => {
    const input = "HelloWorld---";
    const expected = "HelloWorld";
    expect(removeForbiddenCharacters(input, mockConfig.forbiddenCharacters, mockConfig.unifiedSeparator)).toBe(expected);
  });

  test("removes both leading and trailing separators", () => {
    const input = "---HelloWorld---";
    const expected = "HelloWorld";
    expect(removeForbiddenCharacters(input, mockConfig.forbiddenCharacters, mockConfig.unifiedSeparator)).toBe(expected);
  });

  test("handles string with forbidden characters and separators", () => {
    const input = "--#Hello@-World&--";
    const expected = "Hello-World";
    expect(removeForbiddenCharacters(input, mockConfig.forbiddenCharacters, mockConfig.unifiedSeparator)).toBe(expected);
  });

  test("returns empty string when input contains only forbidden characters and separators", () => {
    const input = "--#@&--";
    const expected = "";
    expect(removeForbiddenCharacters(input, mockConfig.forbiddenCharacters, mockConfig.unifiedSeparator)).toBe(expected);
  });

  test("handles empty string", () => {
    const input = "";
    const expected = "";
    expect(removeForbiddenCharacters(input, mockConfig.forbiddenCharacters, mockConfig.unifiedSeparator)).toBe(expected);
  });
});
