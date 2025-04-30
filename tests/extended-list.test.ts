import { linqq as linq } from "../src";

test("addRange()", () => {
  const list = linq([1, 2, 3]).toList();
  list.addRange([4, 5, 6]);
  expect(list.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
  
  const list2 = linq([1, 2, 3]).toList();
  list2.addRange(linq([4, 5, 6]));
  expect(list2.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
  
  const list3 = linq([1, 2, 3]).toList();
  const addedCount = list3.addRange([4, 5, 6]);
  expect(addedCount).toBe(3);
});

test("partition()", () => {
  const list = linq([1, 2, 3, 4, 5, 6]).toList();
  const [even, odd] = list.partition(x => x % 2 === 0);
  expect(even.toArray()).toEqual([2, 4, 6]);
  expect(odd.toArray()).toEqual([1, 3, 5]);
  
  const emptyList = linq<number>([]).toList();
  const [empty1, empty2] = emptyList.partition(x => x % 2 === 0);
  expect(empty1.toArray()).toEqual([]);
  expect(empty2.toArray()).toEqual([]);
});

test("shuffle() / shuffleInPlace()", () => {
  const original = linq([1, 2, 3, 4, 5]).toList();
  const copy = original.toArray();
  
  const shuffled = original.shuffle();
  expect(original.toArray()).toEqual(copy);
  expect(shuffled.toArray().sort()).toEqual(copy.sort());
  
  const inPlace = linq([1, 2, 3, 4, 5]).toList();
  const beforeShuffle = inPlace.toArray();
  inPlace.shuffleInPlace();
  expect(inPlace.toArray().sort()).toEqual(beforeShuffle.sort());
  
  const empty = linq<number>([]).toList();
  expect(empty.shuffle().toArray()).toEqual([]);
  empty.shuffleInPlace();
  expect(empty.toArray()).toEqual([]);
});

test("rotate() / rotateInPlace()", () => {
  const list = linq([1, 2, 3, 4, 5]).toList();
  
  expect(list.rotate(2).toArray()).toEqual([4, 5, 1, 2, 3]);
  expect(list.toArray()).toEqual([1, 2, 3, 4, 5]);
  
  expect(list.rotate(-1).toArray()).toEqual([2, 3, 4, 5, 1]);
  
  list.rotateInPlace(1);
  expect(list.toArray()).toEqual([5, 1, 2, 3, 4]);
  
  const empty = linq<number>([]).toList();
  expect(empty.rotate(1).toArray()).toEqual([]);
  empty.rotateInPlace(1);
  expect(empty.toArray()).toEqual([]);
  
  const full = linq([1, 2, 3]).toList();
  expect(full.rotate(3).toArray()).toEqual([1, 2, 3]);
  expect(full.rotate(6).toArray()).toEqual([1, 2, 3]);
});

test("transform()", () => {
  const list = linq([1, 2, 3]).toList();
  const transformed = list.transform(x => x * 2);
  
  expect(list.toArray()).toEqual([1, 2, 3]);
  expect(transformed.toArray()).toEqual([2, 4, 6]);
  
  const withIndex = linq([1, 2, 3]).toList()
    .transform((x, i) => x + i);
  expect(withIndex.toArray()).toEqual([1, 3, 5]);
  
  const empty = linq<number>([]).toList();
  expect(empty.transform(x => x * 2).toArray()).toEqual([]);
});

test("deepClone()", () => {
  const objList = linq([{ a: 1 }, { a: 2 }]).toList();
  const clone = objList.deepClone();
  
  expect(clone.toArray()).toEqual(objList.toArray());
  expect(clone.toArray()[0]).not.toBe(objList.toArray()[0]);
  
  objList.toArray()[0].a = 10;
  expect(clone.toArray()[0].a).toBe(1);
});

test("median()", () => {
  expect(linq([1, 3, 2]).toList().median()).toBe(2);
  
  expect(linq([1, 2, 3, 4]).toList().median()).toBe(2.5);
  
  const objList = linq([{ val: 1 }, { val: 3 }, { val: 2 }]).toList();
  expect(objList.median(x => x.val)).toBe(2);
  
  expect(() => linq<number>([]).toList().median()).toThrow();
});

test("mode()", () => {
  expect(linq([1, 2, 2, 3]).toList().mode().toArray()).toEqual([2]);
  
  expect(linq([1, 1, 2, 2, 3]).toList().mode().toArray().sort()).toEqual([1, 2]);
  
  const objList = linq([{ val: 1 }, { val: 2 }, { val: 2 }]).toList();
  expect(objList.mode(x => x.val).toArray()).toEqual([2]);
  
  expect(() => linq<number>([]).toList().mode()).toThrow();
});

test("variance() / stdDeviation()", () => {
  const list = linq([2, 4, 4, 4, 5, 5, 7, 9]).toList();
  
  expect(list.variance()).toBe(4);
  expect(list.stdDeviation()).toBe(2);
  
  const objList = linq([{ val: 2 }, { val: 4 }, { val: 6 }]).toList();
  expect(objList.variance(x => x.val)).toBe(Math.pow(4-4, 2)/3 + Math.pow(2-4, 2)/3 + Math.pow(6-4, 2)/3);
  
  expect(() => linq<number>([]).toList().variance()).toThrow();
  expect(() => linq<number>([]).toList().stdDeviation()).toThrow();
});

test("percentile()", () => {
  const list = linq([15, 20, 35, 40, 50]).toList();
  
  expect(list.percentile(40)).toBe(20);
  expect(list.percentile(50)).toBe(35);
  expect(list.percentile(100)).toBe(50);
  
  const objList = linq([{ val: 15 }, { val: 20 }, { val: 35 }]).toList();
  expect(objList.percentile(50, x => x.val)).toBe(20);
  
  expect(() => linq<number>([]).toList().percentile(50)).toThrow();
});

test("product() / harmonicMean() / geometricMean()", () => {
  const list = linq([2, 4, 8]).toList();
  
  expect(list.product()).toBe(64);
  
  expect(list.harmonicMean()).toBeCloseTo(24/7);
  
  expect(list.geometricMean()).toBeCloseTo(4);
  
  const empty = linq<number>([]).toList();
  expect(empty.product()).toBe(1); // Identity for multiplication
  expect(() => empty.harmonicMean()).toThrow(); // Division by zero
  expect(() => empty.geometricMean()).toThrow(); // Power of 1/0
});

test("minMax() / minMaxBy() / range()", () => {
  const list = linq([5, 2, 8, 1, 9]).toList();
  
  expect(list.minMax()).toEqual({ min: 1, max: 9 });
  
  const objList = linq([
    { name: 'A', val: 5 }, 
    { name: 'B', val: 2 }, 
    { name: 'C', val: 9 }
  ]).toList();
  
  const result = objList.minMaxBy(x => x.val);
  expect(result.min.name).toBe('B');
  expect(result.max.name).toBe('C');
  
  expect(list.range()).toBe(8); // 9 - 1
  
  const empty = linq<number>([]).toList();
  expect(() => empty.minMax()).toThrow();
  expect(() => empty.minMaxBy(x => x)).toThrow();
  expect(() => empty.range()).toThrow();
});

test("normalize()", () => {
  const list = linq([1, 2, 5, 10]).toList();
  
  const normalized = list.normalize();
  expect(normalized.toArray()).toEqual([0, 1/9, 4/9, 1]);
  
  const objList = linq([{ val: 1 }, { val: 5 }, { val: 10 }]).toList();
  const objNormalized = objList.normalize(x => x.val);
  expect(objNormalized.toArray()).toEqual([0, 4/9, 1]);
  
  const empty = linq<number>([]).toList();
  expect(() => empty.normalize()).toThrow();
});

test("cumulativeSum()", () => {
  const list = linq([1, 2, 3, 4]).toList();
  
  expect(list.cumulativeSum().toArray()).toEqual([1, 3, 6, 10]);
  
  const objList = linq([{ val: 1 }, { val: 2 }, { val: 3 }]).toList();
  expect(objList.cumulativeSum(x => x.val).toArray()).toEqual([1, 3, 6]);
  
  const empty = linq<number>([]).toList();
  expect(() => empty.cumulativeSum()).toThrow();
});

test("chunk()", () => {
  const list = linq([1, 2, 3, 4, 5, 6, 7]).toList();
  
  const chunks = list.chunk(3);
  expect(chunks.length).toBe(3);
  expect(chunks.toArray()[0].toArray()).toEqual([1, 2, 3]);
  expect(chunks.toArray()[1].toArray()).toEqual([4, 5, 6]);
  expect(chunks.toArray()[2].toArray()).toEqual([7]);
  
  expect(() => list.chunk(0)).toThrow();
  expect(() => list.chunk(-1)).toThrow();
  
  const empty = linq<number>([]).toList();
  expect(empty.chunk(3).toArray()).toEqual([]);
});

test("scan()", () => {
  const list = linq([1, 2, 3, 4]).toList();
  
  const sums = list.scan(0, (acc, val) => acc + val);
  expect(sums.toArray()).toEqual([1, 3, 6, 10]);
  
  const products = list.scan(1, (acc, val) => acc * val);
  expect(products.toArray()).toEqual([1, 2, 6, 24]);
  
  const empty = linq<number>([]).toList();
  expect(empty.scan(0, (acc, val) => acc + val).toArray()).toEqual([]);
});

test("window()", () => {
  const list = linq([1, 2, 3, 4, 5]).toList();
  
  const windows = list.window(3);
  expect(windows.length).toBe(3);
  expect(windows.toArray()[0].toArray()).toEqual([1, 2, 3]);
  expect(windows.toArray()[1].toArray()).toEqual([2, 3, 4]);
  expect(windows.toArray()[2].toArray()).toEqual([3, 4, 5]);
  
  expect(() => list.window(0)).toThrow();
  expect(() => list.window(-1)).toThrow();
  expect(list.window(6).toArray()).toEqual([]);
  
  const empty = linq<number>([]).toList();
  expect(empty.window(3).toArray()).toEqual([]);
});

test("sorting methods", () => {
  const unsorted = linq([5, 3, 1, 4, 2]).toList();
  
  const methods = [
    "sort", "mergeSort", "quickSort", "bubbleSort", 
    "insertionSort", "selectionSort", "heapSort", "shellSort"
  ];
  
  for (const method of methods) {
    const list = linq([5, 3, 1, 4, 2]).toList();
    list[method]();
    expect(list.toArray()).toEqual([1, 2, 3, 4, 5]);
  }
  
  const descList = linq([5, 3, 1, 4, 2]).toList();
  descList.sort((a, b) => b - a);
  expect(descList.toArray()).toEqual([5, 4, 3, 2, 1]);
  
  const empty = linq<number>([]).toList();
  for (const method of methods) {
    empty[method]();
    expect(empty.toArray()).toEqual([]);
  }
});
