import { describe, expect, it } from "vitest";
import bg from "@/locales/bg.json";
import en from "@/locales/en.json";

type Tree = { [key: string]: string | Tree };

function flatten(tree: Tree, prefix = ""): Record<string, string> {
  return Object.entries(tree).reduce<Record<string, string>>((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "string" ? { ...acc, [path]: value } : { ...acc, ...flatten(value, path) };
  }, {});
}

const placeholders = (s: string) => (s.match(/\{\{\s*\w+\s*\}\}/g) ?? []).sort();

describe("translation resources", () => {
  const bgFlat = flatten(bg);
  const enFlat = flatten(en);

  it("bg and en have identical keys", () => {
    expect(Object.keys(enFlat).sort()).toEqual(Object.keys(bgFlat).sort());
  });

  it("no translation is empty", () => {
    for (const [key, value] of [...Object.entries(bgFlat), ...Object.entries(enFlat)]) {
      expect(value.trim(), key).not.toBe("");
    }
  });

  it("interpolation placeholders match between languages", () => {
    for (const key of Object.keys(bgFlat)) {
      expect(placeholders(enFlat[key] ?? ""), key).toEqual(placeholders(bgFlat[key]!));
    }
  });

  it("hero copy matches the brand mock-up", () => {
    expect(bgFlat["hero.title"]).toBe("Върни блясъка.");
    expect(bgFlat["hero.titleAccent"]).toBe("Усети разликата.");
    expect(enFlat["hero.title"]).toBe("Bring back the shine.");
    expect(bgFlat["hero.primaryButton"]).toBe("Запази час");
    expect(enFlat["hero.secondaryButton"]).toBe("See results");
  });
});
