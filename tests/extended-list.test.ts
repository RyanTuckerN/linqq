import linqq from "../src";

test("addRange()", () => {
  const list = linqq([1, 2, 3]).toExtendedList();
  list.addRange([4, 5, 6]);
  expect(list.toArray()).toEqual([1, 2, 3, 4, 5, 6]);

  const list2 = linqq([1, 2, 3]).toExtendedList();
  list2.addRange(linqq([4, 5, 6]));
  expect(list2.toArray()).toEqual([1, 2, 3, 4, 5, 6]);

  const list3 = linqq([1, 2, 3]).toExtendedList();
  const addedCount = list3.addRange([4, 5, 6]);
  expect(addedCount).toBe(3);
});

test("partition()", () => {
  const list = linqq([1, 2, 3, 4, 5, 6]).toExtendedList();
  const [even, odd] = list.partition((x) => x % 2 === 0);
  expect(even.toArray()).toEqual([2, 4, 6]);
  expect(odd.toArray()).toEqual([1, 3, 5]);

  const emptyList = linqq<number>([]).toExtendedList();
  const [empty1, empty2] = emptyList.partition((x) => x % 2 === 0);

  expect(empty1.toArray()).toEqual([]);
  expect(empty2.toArray()).toEqual([]);
});

test("shuffle() / shuffleInPlace()", () => {
  const original = linqq([1, 2, 3, 4, 5]).toExtendedList();
  const copy = original.toArray();

  const shuffled = original.shuffle();
  expect(original.toArray()).toEqual(copy);
  expect(shuffled.toArray().sort()).toEqual(copy.sort());

  const inPlace = linqq([1, 2, 3, 4, 5]).toExtendedList();
  const beforeShuffle = inPlace.toArray();
  inPlace.shuffleInPlace();
  expect(inPlace.toArray().sort()).toEqual(beforeShuffle.sort());

  const empty = linqq<number>([]).toExtendedList();
  expect(empty.shuffle().toArray()).toEqual([]);
  empty.shuffleInPlace();
  expect(empty.toArray()).toEqual([]);
});

test("rotate() / rotateInPlace()", () => {
  const list = linqq([1, 2, 3, 4, 5]).toExtendedList();

  expect(list.rotate(2).toArray()).toEqual([4, 5, 1, 2, 3]);
  expect(list.toArray()).toEqual([1, 2, 3, 4, 5]);

  expect(list.rotate(-1).toArray()).toEqual([2, 3, 4, 5, 1]);

  expect(list.rotateInPlace(1).toArray()).toEqual([5, 1, 2, 3, 4]);
  expect(list.toArray()).toEqual([5, 1, 2, 3, 4]);

  const empty = linqq<number>([]).toExtendedList();
  expect(empty.rotate(1).toArray()).toEqual([]);
  empty.rotateInPlace(1);
  expect(empty.toArray()).toEqual([]);

  const full = linqq([1, 2, 3]).toExtendedList();
  expect(full.rotate(3).toArray()).toEqual([1, 2, 3]);
  expect(full.rotate(6).toArray()).toEqual([1, 2, 3]);
});

test("transform()", () => {
  const list = linqq([1, 2, 3]).toExtendedList();
  const transformed = list.transform((x) => x * 2);

  expect(list.toArray()).toEqual([2, 4, 6]);
  expect(transformed).toBe(list);

  const withIndex = linqq([1, 2, 3])
    .toExtendedList()
    .transform((x, i) => x + i);
  expect(withIndex.toArray()).toEqual([1, 3, 5]);

  const empty = linqq<number>([]).toExtendedList();
  expect(empty.transform((x) => x * 2).toArray()).toEqual([]);
});

test("deepClone()", () => {
  const objList = linqq([{ a: 1 }, { a: 2 }]).toExtendedList();
  const clone = objList.deepClone();

  expect(clone.toArray()).toEqual(objList.toArray());
  expect(clone.toArray()[0]).not.toBe(objList.toArray()[0]);
  objList.toArray()[0].a = 10;
  expect(clone.toArray()[0].a).toBe(1);
});

test("median()", () => {
  expect(linqq([1, 3, 2]).toExtendedList().median()).toBe(2);

  expect(linqq([1, 2, 3, 4]).toExtendedList().median()).toBe(2.5);

  const objList = linqq([{ val: 1 }, { val: 3 }, { val: 2 }]).toExtendedList();
  expect(objList.median((x) => x.val)).toBe(2);

  expect(() => linqq<number>([]).toExtendedList().median()).toThrow();
});

test("mode()", () => {
  expect(linqq([1, 2, 2, 3]).toExtendedList().mode()).toBe(2);

  const multiModeList = linqq([1, 1, 2, 2, 3]).toExtendedList();
  const result = multiModeList.mode();
  expect([1, 2].includes(result)).toBe(true);

  const objList = linqq([{ val: 1 }, { val: 2 }, { val: 2 }]).toExtendedList();
  expect(objList.mode((x) => x.val)).toBe(2);

  expect(() => linqq<number>([]).toExtendedList().mode()).toThrow();
});

test("variance() / stdDeviation()", () => {
  const list = linqq([2, 4, 4, 4, 5, 5, 7, 9]).toExtendedList();

  expect(list.variance()).toBe(4);
  expect(list.stdDeviation()).toBe(2);

  const objList = linqq([{ val: 2 }, { val: 4 }, { val: 6 }]).toExtendedList();
  expect(objList.variance((x) => x.val)).toBe(Math.pow(4 - 4, 2) / 3 + Math.pow(2 - 4, 2) / 3 + Math.pow(6 - 4, 2) / 3);

  expect(() => linqq<number>([]).toExtendedList().variance()).toThrow();
  expect(() => linqq<number>([]).toExtendedList().stdDeviation()).toThrow();
});

test("percentile()", () => {
  const list = linqq([15, 20, 35, 40, 50]).toExtendedList();

  expect(list.percentile(40)).toBe(20);
  expect(list.percentile(50)).toBe(35);
  expect(list.percentile(100)).toBe(50);

  const objList = linqq([{ val: 15 }, { val: 20 }, { val: 35 }]).toExtendedList();
  expect(objList.percentile(50, (x) => x.val)).toBe(20);

  expect(() => linqq<number>([]).toExtendedList().percentile(50)).toThrow();
});

test("product() / harmonicMean() / geometricMean()", () => {
  const list = linqq([2, 4, 8]).toExtendedList();

  expect(list.product()).toBe(64);

  expect(list.harmonicMean()).toBeCloseTo(24 / 7);

  expect(list.geometricMean()).toBeCloseTo(4);

  const empty = linqq<number>([]).toExtendedList();
  expect(empty.product()).toBe(1); // Identity for multiplication
  expect(() => empty.harmonicMean()).toThrow(); // Division by zero
  expect(() => empty.geometricMean()).toThrow(); // Power of 1/0
});

test("minMax() / minMaxBy() / range()", () => {
  const list = linqq([5, 2, 8, 1, 9]).toExtendedList();

  expect(list.minMax()).toEqual({ min: 1, max: 9 });

  const objList = linqq([
    { name: "A", val: 5 },
    { name: "B", val: 2 },
    { name: "C", val: 9 },
  ]).toExtendedList();

  const result = objList.minMaxBy((x) => x.val);
  expect(result.min.name).toBe("B");
  expect(result.max.name).toBe("C");

  expect(list.range()).toBe(8); // 9 - 1

  const empty = linqq.empty<number>().toExtendedList();
  expect(() => empty.minMax()).toThrow();
  expect(() => empty.minMaxBy((x) => x)).toThrow();
  expect(() => empty.range()).toThrow();
});

test("normalize()", () => {
  const list = linqq([1, 2, 5, 10]).toExtendedList();

  const normalized = list.normalize();
  expect(normalized.toArray()).toEqual([0, 1 / 9, 4 / 9, 1]);

  const objList = linqq([{ val: 1 }, { val: 5 }, { val: 10 }]).toExtendedList();
  const objNormalized = objList.normalize((x) => x.val);
  expect(objNormalized.toArray()).toEqual([0, 4 / 9, 1]);

  const empty = linqq<number>([]).toExtendedList();
  expect(() => empty.normalize()).toThrow();
});

test("cumulativeSum()", () => {
  const list = linqq([1, 2, 3, 4]).toExtendedList();

  expect(list.cumulativeSum().toArray()).toEqual([1, 3, 6, 10]);

  const objList = linqq([{ val: 1 }, { val: 2 }, { val: 3 }]).toExtendedList();
  expect(objList.cumulativeSum((x) => x.val).toArray()).toEqual([1, 3, 6]);

  const empty = linqq<number>([]).toExtendedList();
  expect(() => empty.cumulativeSum()).toThrow();
});

test("chunk()", () => {
  const list = linqq([1, 2, 3, 4, 5, 6, 7]).toExtendedList();

  const chunks = list.chunk(3);
  expect(chunks.length).toBe(3);
  expect(chunks[0].toArray()).toEqual([1, 2, 3]);
  expect(chunks[1].toArray()).toEqual([4, 5, 6]);
  expect(chunks[2].toArray()).toEqual([7]);

  expect(() => list.chunk(0)).toThrow();
  expect(() => list.chunk(-1)).toThrow();

  const empty = linqq<number>([]).toExtendedList();
  expect(empty.chunk(3).toArray()).toEqual([]);
});

test("scan()", () => {
  const list = linqq([1, 2, 3, 4]).toExtendedList();

  const sums = list.scan(0, (acc, val) => acc + val);
  expect(sums.toArray()).toEqual([1, 3, 6, 10]);

  const products = list.scan(1, (acc, val) => acc * val);
  expect(products.toArray()).toEqual([1, 2, 6, 24]);

  const empty = linqq<number>([]).toExtendedList();
  expect(empty.scan(0, (acc, val) => acc + val).toArray()).toEqual([]);
});

test("window()", () => {
  const list = linqq([1, 2, 3, 4, 5]).toExtendedList();

  const windows = list.window(3);
  expect(windows.length).toBe(3);
  expect(windows[0].toArray()).toEqual([1, 2, 3]);
  expect(windows[1].toArray()).toEqual([2, 3, 4]);
  expect(windows[2].toArray()).toEqual([3, 4, 5]);

  expect(() => list.window(0)).toThrow();
  expect(() => list.window(-1)).toThrow();
  expect(list.window(6).toArray()).toEqual([]);

  const empty = linqq<number>([]).toExtendedList();
  expect(empty.window(3).toArray()).toEqual([]);
});

test("sorting methods", () => {
  const getUnsorted = () => linqq([5, 3, 1, 4, 2]).toExtendedList();
  const methods = ["sort", "mergeSort", "quickSort", "heapSort"] as const;

  for (const method of methods) {
    const list = getUnsorted();
    list[method]();
    expect(list.toArray()).toEqual([1, 2, 3, 4, 5]);
  }

  const descList = getUnsorted();
  descList.sort((a, b) => b - a);
  expect(descList.toArray()).toEqual([5, 4, 3, 2, 1]);

  const empty = linqq.empty().toExtendedList();

  for (const method of methods) {
    empty[method]();
    expect(empty.toArray()).toEqual([]);
  }
});
