import linqq from "src";
import { benchmarkCompare } from "./test-utils";

test("orderBy - numbers", () => {
  benchmarkCompare({
    label: "orderBy - numbers - array 500_000",
    iterations: 4,
    linqq: (input) =>
      linqq(input)
        .orderBy((x) => x)
        .toArray(),
    native: (input) => input.sort((a, b) => a - b),
    prepareInput: () => numArr.slice(),
  });

  benchmarkCompare({
    label: "orderBy - numbers - generator 500_000",
    iterations: 4,
    linqq: (input) =>
      linqq(input())
        .orderBy((x) => x)
        .toArray(),
    native: (input) => [...input()].sort((a, b) => a - b),
    prepareInput: () => numGen(),
  });

  benchmarkCompare({
    label: "orderBy - numbers - array 500_000 - descending",
    iterations: 4,
    linqq: (input) =>
      linqq(input)
        .orderByDescending((x) => x)
        .toArray(),
    native: (input) => input.sort((a, b) => b - a),
    prepareInput: () => numArr.slice(),
  });

  benchmarkCompare({
    label: "orderBy - numbers - generator 500_000 - descending",
    iterations: 4,
    linqq: (input) =>
      linqq(input())
        .orderByDescending((x) => x)
        .toArray(),
    native: (input) => [...input()].sort((a, b) => b - a),
    prepareInput: () => numGen(),
  });
});

test("orderBy - objects", () => {
  benchmarkCompare({
    label: "orderBy - objects - string property - array 500_000",
    iterations: 4,
    linqq: (input) =>
      linqq(input)
        .orderBy((x) => x.name)
        .toArray(),
    native: (input) => input.sort((a, b) => a.name.localeCompare(b.name)),
    prepareInput: () => objArr.slice(),
  });

  benchmarkCompare({
    label: "orderBy - objects - string property - generator 500_000",
    iterations: 4,
    linqq: (input) =>
      linqq(input())
        .orderBy((x) => x.name)
        .toArray(),
    native: (input) => [...input()].sort((a, b) => a.name.localeCompare(b.name)),
    prepareInput: () => objGen(),
  });

  benchmarkCompare({
    label: "orderBy - objects - string property - array 500_000 - descending",
    iterations: 4,
    linqq: (input) =>
      linqq(input)
        .orderByDescending((x) => x.name)
        .toArray(),
    native: (input) => input.sort((a, b) => b.name.localeCompare(a.name)),
    prepareInput: () => objArr.slice(),
  });

  benchmarkCompare({
    label: "orderBy - objects - string property - generator 500_000 - descending",
    iterations: 4,
    linqq: (input) =>
      linqq(input())
        .orderByDescending((x) => x.name)
        .toArray(),
    native: (input) => [...input()].sort((a, b) => b.name.localeCompare(a.name)),
    prepareInput: () => objGen(),
  });

  benchmarkCompare({
    label: "orderBy - objects - number property - array 500_000",
    iterations: 4,
    linqq: (input) =>
      linqq(input)
        .orderBy((x) => x.value)
        .toArray(),
    native: (input) => input.sort((a, b) => a.value - b.value),
    prepareInput: () => objArr.slice(),
  });

  benchmarkCompare({
    label: "orderBy - objects - number property - generator 500_000",
    iterations: 4,
    linqq: (input) =>
      linqq(input())
        .orderBy((x) => x.value)
        .toArray(),
    native: (input) => [...input()].sort((a, b) => a.value - b.value),
    prepareInput: () => objGen(),
  });

  benchmarkCompare({
    label: "orderBy - objects - number property - array 500_000 - descending",
    iterations: 4,
    linqq: (input) =>
      linqq(input)
        .orderByDescending((x) => x.value)
        .toArray(),
    native: (input) => input.sort((a, b) => b.value - a.value),
    prepareInput: () => objArr.slice(),
  });

  benchmarkCompare({
    label: "orderBy - objects - number property - generator 500_000 - descending",
    iterations: 4,
    linqq: (input) =>
      linqq(input())
        .orderByDescending((x) => x.value)
        .toArray(),
    native: (input) => [...input()].sort((a, b) => b.value - a.value),
    prepareInput: () => objGen(),
  });

  // date property, date.getTime()
  benchmarkCompare({
    label: "orderBy - objects - date.getTime() property - array 500_000",
    iterations: 4,
    linqq: (input) =>
      linqq(input)
        .orderBy((x) => x.date.getTime())
        .toArray(),
    native: (input) => input.sort((a, b) => a.date.getTime() - b.date.getTime()),
    prepareInput: () => objArr.slice(),
  });
  benchmarkCompare({
    label: "orderBy - objects - date.getTime() property - generator 500_000",
    iterations: 4,
    linqq: (input) =>
      linqq(input())
        .orderBy((x) => x.date.getTime())
        .toArray(),
    native: (input) => [...input()].sort((a, b) => a.date.getTime() - b.date.getTime()),
    prepareInput: () => objGen(),
  });

  // raw date property
  benchmarkCompare({
    label: "orderBy - objects - raw date property - array 500_000",
    iterations: 4,
    linqq: (input) =>
      linqq(input)
        .orderBy((x) => x.date)
        .toArray(),
    native: (input) => input.sort((a, b) => <any>a.date - <any>b.date),
    prepareInput: () => objArr.slice(),
  });
  benchmarkCompare({
    label: "orderBy - objects - raw date property - generator 500_000",
    iterations: 4,
    linqq: (input) =>
      linqq(input())
        .orderBy((x) => x.date)
        .toArray(),
    native: (input) => [...input()].slice().sort((a, b) => <any>a.date - <any>b.date),
    prepareInput: () => objGen(),
  });

  benchmarkCompare({
    label: "orderBy - objects - raw date property - array 500_000 - descending",
    iterations: 4,
    linqq: (input) =>
      linqq(input)
        .orderByDescending((x) => x.date)
        .toArray(),
    native: (input) => input.sort((a, b) => <any>b.date - <any>a.date),
    prepareInput: () => objArr.slice(),
  });

  benchmarkCompare({
    label: "orderBy - objects - raw date property - generator 500_000 - descending",
    iterations: 4,
    linqq: (input) =>
      linqq(input())
        .orderByDescending((x) => x.date)
        .toArray(),
    native: (input) => [...input()].slice().sort((a, b) => <any>b.date - <any>a.date),
    prepareInput: () => objGen(),
  });
});

// numbers
const numArr = Array.from({ length: 500_000 }, (_, i) => i);
for (let i = numArr.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [numArr[i], numArr[j]] = [numArr[j], numArr[i]];
}
const numGen = () =>
  function* () {
    yield* numArr;
  };

const ids = Array.from({ length: 500_000 }, (_, i) => i);
// shuffle ids!
for (let i = ids.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [ids[i], ids[j]] = [ids[j], ids[i]];
}
const getRandomDate = () => {
  const start = new Date(2020, 0, 1);
  const end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};
const objArr = Array.from({ length: 500_000 }, (_, i) => ({
  id: ids[i],
  name: `Name ${i}`,
  date: getRandomDate(),
  value: Math.random() * 1000,
  isActive: Math.random() > 0.5,
}));
const objGen = () =>
  function* () {
    yield* objArr;
  };
