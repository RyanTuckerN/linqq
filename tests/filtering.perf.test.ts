import linqq from "src";
import { benchmarkCompare } from "./test-utils";

const arr = Array.from({ length: 1000000 }, (_, i) => i);
const gen = () =>
  function* () {
    for (let i = 0; i < 1000000; i++) yield i;
  };

test("where()", () => {
  benchmarkCompare({
    label: "where() - array 1_000_000",
    linqq: (input) =>
      linqq(input)
        .where((x) => x > 2)
        .toArray(),
    native: (input) => input.filter((x) => x > 2),
    prepareInput: () => arr,
  });

  benchmarkCompare({
    label: "where() - generator 1_000_000",
    linqq: (input) =>
      linqq(input()())
        .where((x) => x > 2)
        .toArray(),
    native: (input) => [...input()()].filter((x) => x > 2),
    prepareInput: () => gen,
  });
});

test("where() - chaining", () => {
  benchmarkCompare({
    label: "where() - chaining - array 1_000_000",
    linqq: (input) =>
      linqq(input)
        .where((x) => !!(x % 2))
        .where((x) => !!(x % 5))
        .where((x) => !!(x % 3))
        .toArray(),
    native: (input) =>
      input
        .filter((x) => !!(x % 2))
        .filter((x) => !!(x % 5))
        .filter((x) => !!(x % 3)),
    prepareInput: () => arr,
  });

  benchmarkCompare({
    label: "where() - chaining - generator 1_000_000",
    linqq: (input) =>
      linqq(input()())
        .where((x) => !!(x % 2))
        .where((x) => !!(x % 5))
        .where((x) => !!(x % 3))
        .toArray(),
    native: (input) =>
      [...input()()]
        .filter((x) => !!(x % 2))
        .filter((x) => !!(x % 5))
        .filter((x) => !!(x % 3)),
    prepareInput: () => gen,
  });
});

test("where() and select() - combination", () => {
  benchmarkCompare({
    label: "where() and select() - combination - array 1_000_000",
    linqq: (input) =>
      linqq(input)
        .where((x) => x > 2)
        .select((x) => x * 2)
        .toArray(),
    native: (input) => input.filter((x) => x > 2).map((x) => x * 2),
    prepareInput: () => arr,
  });

  benchmarkCompare({
    label: "where() and select() - combination - generator 1_000_000",
    linqq: (input) =>
      linqq(input()())
        .where((x) => x > 2)
        .select((x) => x * 2)
        .toArray(),
    native: (input) => [...input()()].filter((x) => x > 2).map((x) => x * 2),
    prepareInput: () => gen,
  });
});

test("where() and select() - combination alternating", () => {
  benchmarkCompare({
    label: "where() and select() - combination alternating - array 1_000_000",
    linqq: (input) =>
      linqq(input)
        .where((x) => x > 2)
        .select((x) => x * 2)
        .where((x) => x < 10)
        .select((x) => x + 1)
        .toArray(),
    native: (input) =>
      input
        .filter((x) => x > 2)
        .map((x) => x * 2)
        .filter((x) => x < 10)
        .map((x) => x + 1),
    prepareInput: () => arr,
  });

  benchmarkCompare({
    label: "where() and select() - combination alternating - generator 1_000_000",
    linqq: (input) =>
      linqq(input()())
        .where((x) => x > 2)
        .select((x) => x * 2)
        .where((x) => x < 10)
        .select((x) => x + 1)
        .toArray(),
    native: (input) =>
      [...input()()]
        .filter((x) => x > 2)
        .map((x) => x * 2)
        .filter((x) => x < 10)
        .map((x) => x + 1),
    prepareInput: () => gen,
  });
});
