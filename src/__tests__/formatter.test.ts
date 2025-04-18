import { expect, test, describe, beforeEach, afterEach } from "bun:test";
import { removeForbiddenPrefixes } from "../formatter.ts";

import { config } from "../configuration";
// Mock config for testing
const mockConfig = {
  forbiddenCharacters: ["#", "@", "&"],
  unifiedSeparator: "-",
};

// Store original config
let originalConfig = config;

describe("removeForbiddenPrefixes", () => {
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
    expect(removeForbiddenPrefixes(input, mockConfig.forbiddenCharacters, mockConfig.unifiedSeparator)).toBe(expected);
  });

  test("removes leading separators", () => {
    const input = "---HelloWorld";
    const expected = "HelloWorld";
    expect(removeForbiddenPrefixes(input, mockConfig.forbiddenCharacters, mockConfig.unifiedSeparator)).toBe(expected);
  });

  test("removes trailing separators", () => {
    const input = "HelloWorld---";
    const expected = "HelloWorld";
    expect(removeForbiddenPrefixes(input, mockConfig.forbiddenCharacters, mockConfig.unifiedSeparator)).toBe(expected);
  });

  test("removes both leading and trailing separators", () => {
    const input = "---HelloWorld---";
    const expected = "HelloWorld";
    expect(removeForbiddenPrefixes(input, mockConfig.forbiddenCharacters, mockConfig.unifiedSeparator)).toBe(expected);
  });

  test("handles string with forbidden characters and separators", () => {
    const input = "--#Hello@-World&--";
    const expected = "Hello-World";
    expect(removeForbiddenPrefixes(input, mockConfig.forbiddenCharacters, mockConfig.unifiedSeparator)).toBe(expected);
  });

  test("returns empty string when input contains only forbidden characters and separators", () => {
    const input = "--#@&--";
    const expected = "";
    expect(removeForbiddenPrefixes(input, mockConfig.forbiddenCharacters, mockConfig.unifiedSeparator)).toBe(expected);
  });

  test("handles empty string", () => {
    const input = "";
    const expected = "";
    expect(removeForbiddenPrefixes(input, mockConfig.forbiddenCharacters, mockConfig.unifiedSeparator)).toBe(expected);
  });
});
