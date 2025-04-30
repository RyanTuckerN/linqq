import { linqq as linq } from "../src";

test("getRandom() / popRandom() / sample()", () => {
  const list = linq([1, 2, 3, 4, 5]).toList();
  
  const random = list.getRandom();
  expect(list.toArray().includes(random)).toBe(true);
  expect(list.length).toBe(5); // List unchanged
  
  const popped = list.popRandom();
  expect(list.length).toBe(4);
  expect(list.toArray().includes(popped)).toBe(false);
  
  const sampled = list.sample(2);
  expect(sampled.length).toBe(2);
  sampled.forEach(item => expect(list.toArray().includes(item)).toBe(true));
  
  expect(list.sample(0).toArray()).toEqual([]);
  expect(list.sample(-1).toArray()).toEqual([]);
  expect(list.sample(10).length).toBe(4); // More than available returns all shuffled
});

test("frequencies()", () => {
  const list = linq([1, 2, 2, 3, 3, 3]).toList();
  const freq = list.frequencies();
  
  expect(freq.get(1)).toBe(1);
  expect(freq.get(2)).toBe(2);
  expect(freq.get(3)).toBe(3);
  
  const objList = linq([
    { id: 1, type: 'A' },
    { id: 2, type: 'B' },
    { id: 3, type: 'A' }
  ]).toList();
  
  const objFreq = objList.frequencies();
  expect(objFreq.count()).toBe(3); // Each object is unique by reference
  
  const empty = linq<number>([]).toList();
  expect(empty.frequencies().count()).toBe(0);
});

test("top() / bottom()", () => {
  const list = linq([5, 3, 1, 4, 2]).toList();
  
  expect(list.top(2).toArray()).toEqual([1, 2]);
  
  expect(list.bottom(2).toArray()).toEqual([4, 5]);
  
  expect(list.top(2, (a, b) => b - a).toArray()).toEqual([5, 4]);
  expect(list.bottom(2, (a, b) => b - a).toArray()).toEqual([2, 1]);
  
  expect(list.top(0).toArray()).toEqual([]);
  expect(list.top(10).length).toBe(5);
  
  const empty = linq<number>([]).toList();
  expect(empty.top(2).toArray()).toEqual([]);
  expect(empty.bottom(2).toArray()).toEqual([]);
});

test("paginate()", () => {
  const list = linq([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).toList();
  
  expect(list.paginate(3, 1).toArray()).toEqual([1, 2, 3]);
  
  expect(list.paginate(3, 2).toArray()).toEqual([4, 5, 6]);
  
  expect(list.paginate(3, 4).toArray()).toEqual([10]);
  
  expect(list.paginate(3, 5).toArray()).toEqual([]);
  
  expect(list.paginate(0).toArray()).toEqual([]);
  expect(list.paginate(-1).toArray()).toEqual([]);
  
  const empty = linq<number>([]).toList();
  expect(empty.paginate(3).toArray()).toEqual([]);
});
