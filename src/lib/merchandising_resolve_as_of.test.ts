import { test } from "node:test";
import assert from "node:assert";
import { resolveAsOfIso } from "./merchandising_resolve_as_of";

test("resolveAsOfIso defaults to now when raw is undefined", () => {
  const before = Date.now();
  const result = resolveAsOfIso(undefined);
  const after = Date.now();
  assert.strictEqual(result.ok, true);
  if (result.ok) {
    const ms = new Date(result.asOfIso).getTime();
    assert.ok(ms >= before - 1000 && ms <= after + 1000);
  }
});

test("resolveAsOfIso maps valid ISO to asOfIso string", () => {
  const result = resolveAsOfIso("2026-05-06T08:00:00.000Z");
  assert.deepStrictEqual(result, { ok: true, asOfIso: "2026-05-06T08:00:00.000Z" });
});

test("resolveAsOfIso returns INVALID_AS_OF for unparseable input", () => {
  const result = resolveAsOfIso("not-a-date");
  assert.deepStrictEqual(result, { ok: false, code: "INVALID_AS_OF" });
});

test("resolveAsOfIso returns AS_OF_IN_FUTURE for far-future input", () => {
  const result = resolveAsOfIso("2099-01-01T00:00:00.000Z");
  assert.deepStrictEqual(result, { ok: false, code: "AS_OF_IN_FUTURE" });
});
