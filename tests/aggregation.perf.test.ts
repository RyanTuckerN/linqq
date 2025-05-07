import linqq, { generator } from "src";
import { benchmarkCompare } from "./test-utils";

test("count", async () => {
  await benchmarkCompare({
    label: "Count: array 1_000_000",
    linqq: (input) => linqq(input).count(),
    native: (input) => input.length,
    prepareInput: () => Array.from({ length: 1000000 }, (_, i) => i),
    quiet: true,
  });

  await benchmarkCompare({
    label: "Count: generator 1_000_000",
    linqq: (input) => linqq(input()).count(),
    native: (input) => [...input()].length,
    prepareInput: () => generator(1000000),
    quiet: true,
  });
});

test("sum", async () => {
  await benchmarkCompare({
    label: "Sum: array 1_000_000",
    linqq: (input) => linqq(input).sum(),
    native: (input) => input.reduce((acc, val) => acc + val, 0),
    prepareInput: () => Array.from({ length: 1000000 }, (_, i) => i),
    quiet: true,
  });

  await benchmarkCompare({
    label: "Sum: generator 1_000_000",
    linqq: (input) => linqq(input()).sum(),
    native: (input) => [...input()].reduce((acc, val) => acc + val, 0),
    prepareInput: () => generator(1000000),
    quiet: true,
  });
});

test("average", async () => {
  await benchmarkCompare({
    label: "Average: array 1_000_000",
    linqq: (input) => linqq(input).average(),
    native: (input) => input.reduce((acc, val) => acc + val, 0) / input.length,
    prepareInput: () => Array.from({ length: 1000000 }, (_, i) => i),
    quiet: true,
  });

  await benchmarkCompare({
    label: "Average: generator 1_000_000",
    linqq: (input) => linqq(input()).average(),
    native: (input) => [...input()].reduce((acc, val) => acc + val, 0) / [...input()].length,
    prepareInput: () => generator(1000000),
    quiet: true,
  });
});

test("max", async () => {
  await benchmarkCompare({
    label: "Max: array 1_000_000",
    linqq: (input) => linqq(input).max(),
    native: (input) => input.reduce((acc, val) => (val > acc ? val : acc), -Infinity),
    prepareInput: () => Array.from({ length: 1000000 }, (_, i) => i),
    quiet: true,
  });

  await benchmarkCompare({
    label: "Max: generator 1_000_000",
    linqq: (input) => linqq(input()).max(),
    native: (input) => [...input()].reduce((acc, val) => (val > acc ? val : acc), -Infinity),
    prepareInput: () => generator(1000000),
    quiet: true,
  });
});

test("min", async () => {
  await benchmarkCompare({
    label: "Min: array 1_000_000",
    linqq: (input) => linqq(input).min(),
    native: (input) => input.reduce((acc, val) => (val < acc ? val : acc), Infinity),
    prepareInput: () => Array.from({ length: 1000000 }, (_, i) => i),
    quiet: true,
  });

  await benchmarkCompare({
    label: "Min: generator 1_000_000",
    linqq: (input) => linqq(input()).min(),
    native: (input) => [...input()].reduce((acc, val) => (val < acc ? val : acc), Infinity),
    prepareInput: () => generator(1000000),
    quiet: true,
  });
});

test("aggregate", async () => {
  await benchmarkCompare({
    label: "Aggregate: array 1_000_000",
    linqq: (input) => linqq(input).aggregate(0, (acc, val) => acc + val),
    native: (input) => input.reduce((acc, val) => acc + val, 0),
    prepareInput: () => Array.from({ length: 1000000 }, (_, i) => i),
    quiet: true,
  });

  await benchmarkCompare({
    label: "Aggregate: generator 1_000_000",
    linqq: (input) => linqq(input()).aggregate(0, (acc, val) => acc + val),
    native: (input) => [...input()].reduce((acc, val) => acc + val, 0),
    prepareInput: () => generator(1000000),
    quiet: true,
  });
});
