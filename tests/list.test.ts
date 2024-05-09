import linq from "../src";

// list tests 

test(" *** List ***", () => {
  expect(linq([])).toHaveProperty("add");
  expect(linq([])).toHaveProperty("insert");
  expect(linq([])).toHaveProperty("removeAt");
  expect(linq([])).toHaveProperty("get");
  expect(linq([])).toHaveProperty("set");
  expect(linq([])).toHaveProperty("isEmpty");
  expect(linq([])).toHaveProperty("remove");
  expect(linq([])).toHaveProperty("clear");
  expect(linq([])).toHaveProperty("forEach");
  expect(linq([])).toHaveProperty("length");
});


test("add()", () => {
  const list = linq([1, 2, 3]);
  list.add(4);
  expect(list.toArray()).toEqual([1, 2, 3, 4]);
});

test("insert()", () => {
  const list = linq([1, 2, 3]);
  list.insert(1, 4);
  expect(list.toArray()).toEqual([1, 4, 2, 3]);
});

test("removeAt()", () => {
  const list = linq([1, 2, 3]);
  list.removeAt(1);
  expect(list.toArray()).toEqual([1, 3]);
});

test("get()", () => {
  const list = linq([1, 2, 3]);
  expect(list.get(1)).toBe(2);
});

test("set()", () => {
  const list = linq([1, 2, 3]);
  list.set(1, 4);
  expect(list.toArray()).toEqual([1, 4, 3]);
});

test("isEmpty()", () => {
  const list = linq<number>([]);
  expect(list.isEmpty()).toBe(true);
  list.add(1);
  expect(list.isEmpty()).toBe(false);
});

test("remove()", () => {
  const list = linq([1, 2, 3]);
  list.remove(2);
  expect(list.toArray()).toEqual([1, 3]);
  expect(list.remove(2)).toBe(false);
});

test("clear()", () => {
  const list = linq([1, 2, 3]);
  list.clear();
  expect(list.isEmpty()).toBe(true);
});

test("forEach()", () => {
  const list = linq([1, 2, 3]);
  const arr: number[] = [];
  list.forEach((x) => arr.push(x));
  expect(arr).toEqual([1, 2, 3]);
});

test("length", () => {
  const list = linq([1, 2, 3]);
  expect(list.length).toBe(3);
});

test("forEach() with current", () => {
  const list = linq([1, 2, 3]);
  const arr: number[] = [];
  list.forEach((x, i, l) => {
    l.set(i, x + 10);
    arr.push(x);
  });
  expect(arr).toEqual([1, 2, 3]);
  expect(list.toArray()).toEqual([11, 12, 13]);
});

test("indexing", () => {
  const list = linq([1, 2, 3]);
  expect(list[0]).toBe(1);
  expect(list[1]).toBe(2);
  expect(list[2]).toBe(3);
  list[1] = 4;
  expect(list.toArray()).toEqual([1, 4, 3]);
});