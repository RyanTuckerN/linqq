import linq from "../src";


test(" *** Joining ***", () => {
  expect(emptyLinqArray).toHaveProperty("join");
  expect(emptyLinqArray).toHaveProperty("groupJoin");
  expect(emptyLinqArray.join).toBeInstanceOf(Function);
  expect(emptyLinqArray.groupJoin).toBeInstanceOf(Function);
});

test("join()", () => {
  const items = linq(itemsArray);
  const people = linq(peopleArray);

  const result = items.join(
    people.toList(),
    (item) => item.createUserId,
    (person) => person.id,
    (item, person) => ({ item, person }),
  );

  expect(result.toArray()).toEqual([
    { item: item1, person: bob },
    { item: item2, person: bob },
    { item: item3, person: charlie },
    { item: item4, person: charlie },
    { item: item5, person: charlie },
  ]);
});

test("join() works joining a regular array", () => {
  const items = linq(itemsArray);

  const result = items.join(
    peopleArray,
    (item) => item.createUserId,
    (person) => person.id,
    (item, person) => ({ item, person }),
  );

  expect(result.toArray()).toEqual([
    { item: item1, person: bob },
    { item: item2, person: bob },
    { item: item3, person: charlie },
    { item: item4, person: charlie },
    { item: item5, person: charlie },
  ]);
});

test("groupJoin()", () => {
  const items = linq(itemsArray);
  const people = linq(peopleArray);

  const result = people.groupJoin(
    items.toList(),
    (person) => person.id,
    (item) => item.createUserId,
    (person, items) => ({ person, items: items.toArray() }),
  );

  expect(result.toArray()).toEqual([
    { person: alice, items: [] },
    { person: bob, items: [item1, item2] },
    { person: charlie, items: [item3, item4, item5] },
  ]);
});

const emptyLinqArray = linq([]);
const alice = {
  id: 123,
  name: "Alice",
  age: 40,
  enrolled: true,
  hobbies: ["reading", "swimming", "biking"],
};
const bob = {
  id: 234,
  name: "Bob",
  age: 30,
  enrolled: false,
  hobbies: ["biking", "hiking", "swimming"],
};
const charlie = {
  id: 345,
  name: "Charlie",
  age: 50,
  enrolled: true,
  hobbies: ["fishing", "camping", "swimming"],
};
const peopleArray = [alice, bob, charlie];

const item1 = { id: 1, createUserId: 234, name: "item1" };
const item2 = { id: 2, createUserId: 234, name: "item2" };
const item3 = { id: 3, createUserId: 345, name: "item3" };
const item4 = { id: 4, createUserId: 345, name: "item4" };
const item5 = { id: 5, createUserId: 345, name: "item5" };
const itemsArray = [item1, item2, item3, item4, item5];

