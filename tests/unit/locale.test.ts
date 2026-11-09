import { describe, expect, it } from "vitest";
import {
  buildLocalizedPath,
  parseLanguageFromPath,
  resolveInitialLanguage,
  storeLanguage,
} from "@/lib/locale";
import { mailtoHref, telHref, viberHref } from "@/lib/contact";

describe("localized routing helpers", () => {
  it("reads the language from the path", () => {
    expect(parseLanguageFromPath("/bg/")).toBe("bg");
    expect(parseLanguageFromPath("/en")).toBe("en");
    expect(parseLanguageFromPath("/")).toBeNull();
    expect(parseLanguageFromPath("/de/")).toBeNull();
  });

  it("builds paths and preserves a safe section hash", () => {
    expect(buildLocalizedPath("en", "#gallery")).toBe("/en/#gallery");
    expect(buildLocalizedPath("bg")).toBe("/bg/");
    expect(buildLocalizedPath("bg", "#<script>")).toBe("/bg/");
  });

  it("resolves URL > stored preference > default", () => {
    expect(resolveInitialLanguage("/", "bg")).toBe("bg");
    storeLanguage("en");
    expect(resolveInitialLanguage("/", "bg")).toBe("en");
    expect(resolveInitialLanguage("/bg/", "bg")).toBe("bg");
  });
});

describe("contact links", () => {
  it("returns null for unconfigured values", () => {
    expect(telHref("")).toBeNull();
    expect(mailtoHref(" ")).toBeNull();
    expect(viberHref("")).toBeNull();
  });

  it("builds tel, mailto and viber links", () => {
    expect(telHref("+359 88 123 4567")).toBe("tel:+359881234567");
    expect(mailtoHref("info@example.com")).toBe("mailto:info@example.com");
    expect(viberHref("+359 88 123 4567")).toBe("viber://chat?number=%2B359881234567");
  });
});
