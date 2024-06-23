import { linqq as linq } from "../src";

test("create()", () => {
  const dict = linq(["Alice", "Bob", "Charlie"]).toDictionary((x) => x);
  expect(dict.count()).toBe(3);
});

// Can access values by key
test("direct index access", () => {
  const dict = getPeopleDict();
  expect(dict[123].name).toBe("Alice");
  expect(dict[345].name).toBe("Charlie");
  expect(dict["234"].name).toBe("Bob"); // that this works is kind of a bug,but really is a feature...
  dict["234"] = { id: 234, name: "Bobby", age: 41, hobbyIds: [2, 3, 4, 14] };
  expect(dict[234].name).toBe("Bobby");
  expect(dict.get(234).name).toBe("Bobby");
  dict[234].age = 42;
  expect(dict[234].age).toBe(42);
  expect(dict.get(234).age).toBe(42);
  expect(dict.get(234).hobbyIds).toEqual([2, 3, 4, 14]);
});

test("add()", () => {
  const dict = getPeopleDict();
  dict.add({ key: 1234, value: { id: 1234, name: "Zelda", age: 130, hobbyIds: [1, 2, 3] } });
  expect(dict[1234].name).toBe("Zelda");
});

test("remove()", () => {
  const dict = getPeopleDict();
  dict.remove(123);
  expect(dict.containsKey(123)).toBe(false);
});

test("clear()", () => {
  const dict = getPeopleDict();
  dict.clear();
  expect(dict.toArray()).toEqual([]);
});

test("containsKey()", () => {
  const dict = getPeopleDict();
  expect(dict.containsKey(123)).toBe(true);
  expect(dict.containsKey(1234)).toBe(false);
});

test("tryGetValue()", () => {
  const dict = getPeopleDict();
  const [hasKey, value] = dict.tryGetValue(123);
  expect(hasKey).toBe(true);
  if (hasKey) {
    // TypeScript is able to infer value is not undefined here because of the return structure of the method...
    expect(value.name).toBe("Alice");
  }
  const [hasKey2, value2] = dict.tryGetValue(1234);
  expect(hasKey2).toBe(false);
  expect(value2).toBeUndefined();
});

test("toList()", () => {
  const dict = getPeopleDict();
  const list = dict.toList();
  expect(list).toHaveProperty("where");
  expect(list.count()).toBe(10);
});

test("toArray()", () => {
  const dict = getPeopleDict();
  const arr = dict.toArray();
  expect(arr.length).toBe(10);
});

const getPeopleDict = () => {
  const people = linq([
    { id: 123, name: "Alice", age: 30, hobbyIds: [1, 2, 3] },
    { id: 234, name: "Bob", age: 40, hobbyIds: [2, 3, 4, 10] },
    { id: 345, name: "Charlie", age: 50, hobbyIds: [3, 4, 5] },
    { id: 456, name: "David", age: 60, hobbyIds: [4, 5, 6] },
    { id: 567, name: "Eve", age: 70, hobbyIds: [9, 5, 1] },
    { id: 678, name: "Frank", age: 80, hobbyIds: [10, 2, 3] },
    { id: 789, name: "Grace", age: 90, hobbyIds: [7, 8, 9] },
    { id: 890, name: "Hannah", age: 100, hobbyIds: [6, 7, 8, 10] },
    { id: 901, name: "Isaac", age: 110, hobbyIds: [5, 6, 7] },
    { id: 912, name: "Jack", age: 120, hobbyIds: [4, 5, 6] },
  ]);
  const dict = people.toDictionary((obj) => obj.id);
  return dict;
};
