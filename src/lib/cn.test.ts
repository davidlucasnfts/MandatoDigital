import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merge classes simples", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("remove classes conflitantes do tailwind-merge", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("ignora valores falsy", () => {
    const shouldShow = false;
    expect(cn("foo", shouldShow && "bar", "baz")).toBe("foo baz");
  });

  it("lida com objetos condicionais", () => {
    expect(cn({ "bg-red-500": true, "bg-blue-500": false })).toBe("bg-red-500");
  });
});
