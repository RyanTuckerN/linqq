import { linqq as linq, IEnumerable } from "../src";



test(" *** Sorting ***", () => {
  expect(emptyLinqArray).toHaveProperty("orderBy");
  expect(emptyLinqArray).toHaveProperty("orderByDescending");
  expect(emptyLinqArray.orderBy).toBeInstanceOf(Function);
  expect(emptyLinqArray.orderByDescending).toBeInstanceOf(Function);
  const orderedAsc = linq(numsArray).orderBy((x) => x);
  expect(orderedAsc).toHaveProperty("thenBy");
  expect(orderedAsc).toHaveProperty("thenByDescending");
  const orderedDesc = linq(numsArray).orderByDescending((x) => x);
  expect(orderedDesc).toHaveProperty("thenBy");
  expect(orderedDesc).toHaveProperty("thenByDescending");
});

test("orderBy() - numbers", () => {
  expect(
    linq(numsArray)
      .orderBy((x) => x)
      .toArray(),
  ).toEqual([1, 2, 3, 4, 5]);
});

test("orderByDescending() - numbers", () => {
  expect(
    linq(numsArray)
      .orderByDescending((x) => x)
      .toArray(),
  ).toEqual([5, 4, 3, 2, 1]);
});

test("orderBy() - objects", () => {
  const people = linq(peopleArray);
  expect(people.orderBy((x) => x.id).toArray()).toEqual([alice, bob, charlie]);
  expect(people.orderBy((x) => x.name).toArray()).toEqual([alice, bob, charlie]);
  expect(people.orderBy((x) => x.age).toArray()).toEqual([bob, alice, charlie]);
});

test("orderByDescending() - objects", () => {
  const people = linq(peopleArray);
  expect(people.orderByDescending((x) => x.id).toArray()).toEqual([charlie, bob, alice]);
  expect(people.orderByDescending((x) => x.name).toArray()).toEqual([charlie, bob, alice]);
  expect(people.orderByDescending((x) => x.age).toArray()).toEqual([charlie, alice, bob]);
});

test("thenBy() - objects", () => {
  const employees = linq(employeesArray);
  const deptThenAge = employees
    .orderBy((x) => x.department)
    .thenBy((x) => x.name)
    .select(({ name, department }) => ({ name, department }));

  expect(deptThenAge.toArray()).toEqual([
    { name: "Alicia", department: "HR" },
    { name: "Chuck", department: "HR" },
    { name: "Eve", department: "HR" },
    { name: "Grace", department: "HR" },
    { name: "Ivan", department: "HR" },
    { name: "Kent", department: "HR" },
    { name: "Bill", department: "IT" },
    { name: "David", department: "IT" },
    { name: "Frank", department: "IT" },
    { name: "Heidi", department: "IT" },
    { name: "Jenny", department: "IT" },
    { name: "Leonard", department: "IT" },
  ]);

  const deptThenAgeDesc = employees
    .orderByDescending((x) => x.department)
    .thenBy((x) => x.basePay)
    .thenBy((x) => x.name)
    .select(({ name, department, basePay }) => ({ name, department, basePay }));

  expect(deptThenAgeDesc.toArray()).toEqual([
    { name: "Bill", department: "IT", basePay: 60000 },
    { name: "David", department: "IT", basePay: 80000 },
    { name: "Frank", department: "IT", basePay: 100000 },
    { name: "Heidi", department: "IT", basePay: 120000 },
    { name: "Leonard", department: "IT", basePay: 120000 },
    { name: "Jenny", department: "IT", basePay: 140000 },
    { name: "Alicia", department: "HR", basePay: 50000 },
    { name: "Chuck", department: "HR", basePay: 70000 },
    { name: "Eve", department: "HR", basePay: 90000 },
    { name: "Grace", department: "HR", basePay: 110000 },
    { name: "Ivan", department: "HR", basePay: 130000 },
    { name: "Kent", department: "HR", basePay: 150000 },
  ]);

  const a02010a = { name: "Adam", access: AccessLevel.Guest, startDate: new Date("2010-01-01") };
  const a02010z = { name: "Zack", access: AccessLevel.Guest, startDate: new Date("2010-01-01") };
  const a02011b = { name: "Bill", access: AccessLevel.Guest, startDate: new Date("2011-01-01") };
  const a1s2010a = { name: "Alice", access: AccessLevel.User, startDate: new Date("2010-01-01") };
  const a1s2011b = { name: "Bob", access: AccessLevel.User, startDate: new Date("2011-01-01") };
  const a1s2011a = { name: "Alvin", access: AccessLevel.User, startDate: new Date("2013-01-01") };
  const a2s2012c = { name: "Carl", access: AccessLevel.Admin, startDate: new Date("2012-01-01") };
  const a2s2014d = { name: "Dylan", access: AccessLevel.Admin, startDate: new Date("2014-01-01") };
  const a2s2014c = { name: "Cait", access: AccessLevel.Admin, startDate: new Date("2017-01-01") };

  const ordered = [a02010a, a02010z, a02011b, a1s2010a, a1s2011b, a1s2011a, a2s2012c, a2s2014d, a2s2014c];

  const randomOrder = [...ordered].sort(() => Math.random() - 0.5);

  const accessLevelThenHireDateThenName = linq(randomOrder)
    .orderBy((x) => x.access)
    .thenBy((x) => x.startDate)
    .thenBy((x) => x.name);

  expect(accessLevelThenHireDateThenName.toArray()).toEqual(ordered);
});

function _createOrderByCase<T>(ordered: T[], expression: (randomized: IEnumerable<T>) => IEnumerable<T>) {
  const randomOrder = [...ordered].sort(() => Math.random() - 0.5);
  const result = expression(linq(randomOrder));
  expect(result.toArray()).toEqual(ordered);
}

test("thenByDescending() - objects", () => {
  const employees = linq(employeesArray);
  const deptThenName = employees
    .orderBy((x) => x.department)
    .thenByDescending((x) => x.name)
    .select(({ name, department }) => ({ name, department }));

  expect(deptThenName.toArray()).toEqual([
    { name: "Kent", department: "HR" },
    { name: "Ivan", department: "HR" },
    { name: "Grace", department: "HR" },
    { name: "Eve", department: "HR" },
    { name: "Chuck", department: "HR" },
    { name: "Alicia", department: "HR" },
    { name: "Leonard", department: "IT" },
    { name: "Jenny", department: "IT" },
    { name: "Heidi", department: "IT" },
    { name: "Frank", department: "IT" },
    { name: "David", department: "IT" },
    { name: "Bill", department: "IT" },
  ]);

  _createOrderByCase(
    [
      { name: "Jenny", department: "IT", basePay: 140000 },
      { name: "Heidi", department: "IT", basePay: 120000 },
      { name: "Frank", department: "IT", basePay: 100000 },
      { name: "David", department: "IT", basePay: 80000 },
      { name: "Bill", department: "IT", basePay: 60000 },
      { name: "Kent", department: "HR", basePay: 150000 },
      { name: "Ivan", department: "HR", basePay: 130000 },
      { name: "Grace", department: "HR", basePay: 110000 },
      { name: "Eve", department: "HR", basePay: 90000 },
      { name: "Chuck", department: "HR", basePay: 70000 },
      { name: "Alicia", department: "HR", basePay: 50000 },
    ],
    (x) => x.orderByDescending((x) => x.department).thenByDescending((x) => x.basePay),
  );

  _createOrderByCase(
    [
      { name: "Bill", department: "IT", startDate: new Date("2019-06-01").toISOString() },
      { name: "David", department: "IT", startDate: new Date("2017-01-01").toISOString() },
      { name: "Frank", department: "IT", startDate: new Date("2015-01-01").toISOString() },
      { name: "Heidi", department: "IT", startDate: new Date("2013-01-01").toISOString() },
      { name: "Jenny", department: "IT", startDate: new Date("2011-01-01").toISOString() },
      { name: "Alicia", department: "HR", startDate: new Date("2020-01-01").toISOString() },
      { name: "Chuck", department: "HR", startDate: new Date("2018-01-01").toISOString() },
      { name: "Eve", department: "HR", startDate: new Date("2016-01-01").toISOString() },
      { name: "Grace", department: "HR", startDate: new Date("2014-01-01").toISOString() },
      { name: "Ivan", department: "HR", startDate: new Date("2012-01-01").toISOString() },
      { name: "Kent", department: "HR", startDate: new Date("2010-01-01").toISOString() },
    ],
    (x) =>
      x
        .orderByDescending((x) => x.department)
        .thenByDescending((x) => x.startDate)
        .thenByDescending((x) => x.name),
  );
});

const emptyLinqArray = linq([]);
const numsArray = [1, 2, 3, 4, 5];
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

enum AccessLevel {
  Guest,
  User,
  Admin,
}
type Person = {
  name: string;
  age: number;
  accessLevel: AccessLevel;
  department: string;
  title: string;
  id: string;
  basePay: number;
  startDate: Date;
  address: Address;
};

type Address = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
};

const alicia: Person = {
    name: "Alicia",
    age: 25,
    accessLevel: AccessLevel.Admin,
    department: "HR",
    title: "Manager",
    id: "143651-123",
    basePay: 50000,
    startDate: new Date("2020-01-01"),
    address: {
      street: "123 Main St",
      city: "Springfield",
      state: "IL",
      zipCode: "62701",
    },
  },
  bill: Person = {
    name: "Bill",
    age: 30,
    accessLevel: AccessLevel.User,
    department: "IT",
    title: "Developer",
    id: "987654-321",
    basePay: 60000,
    startDate: new Date("2019-06-01"),
    address: {
      street: "123 Main St",
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
    },
  },
  chuck: Person = {
    name: "Chuck",
    age: 35,
    accessLevel: AccessLevel.Guest,
    department: "HR",
    title: "Manager",
    id: "123456-789",
    basePay: 70000,
    startDate: new Date("2018-01-01"),
    address: {
      street: "123 Main St",
      city: "Springfield",
      state: "IL",
      zipCode: "62701",
    },
  },
  david: Person = {
    name: "David",
    age: 40,
    accessLevel: AccessLevel.Admin,
    department: "IT",
    title: "Director",
    id: "456789-123",
    basePay: 80000,
    startDate: new Date("2017-01-01"),
    address: {
      street: "123 Main St",
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
    },
  },
  eve: Person = {
    name: "Eve",
    age: 45,
    accessLevel: AccessLevel.User,
    department: "HR",
    title: "Manager",
    id: "789123-456",
    basePay: 90000,
    startDate: new Date("2016-01-01"),
    address: {
      street: "123 Main St",
      city: "Springfield",
      state: "IL",
      zipCode: "62701",
    },
  },
  frank: Person = {
    name: "Frank",
    age: 50,
    accessLevel: AccessLevel.Guest,
    department: "IT",
    title: "Developer",
    id: "321654-987",
    basePay: 100000,
    startDate: new Date("2015-01-01"),
    address: {
      street: "123 Main St",
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
    },
  },
  grace: Person = {
    name: "Grace",
    age: 55,
    accessLevel: AccessLevel.Admin,
    department: "HR",
    title: "Director",
    id: "654987-321",
    basePay: 110000,
    startDate: new Date("2014-01-01"),
    address: {
      street: "123 Main St",
      city: "Springfield",
      state: "IL",
      zipCode: "62701",
    },
  },
  heidi: Person = {
    name: "Heidi",
    age: 60,
    accessLevel: AccessLevel.User,
    department: "IT",
    title: "Manager",
    id: "987321-654",
    basePay: 120000,
    startDate: new Date("2013-01-01"),
    address: {
      street: "123 Main St",
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
    },
  },
  ivan: Person = {
    name: "Ivan",
    age: 65,
    accessLevel: AccessLevel.Guest,
    department: "HR",
    title: "Developer",
    id: "321987-654",
    basePay: 130000,
    startDate: new Date("2012-01-01"),
    address: {
      street: "123 Main St",
      city: "Springfield",
      state: "IL",
      zipCode: "62701",
    },
  },
  jenny: Person = {
    name: "Jenny",
    age: 70,
    accessLevel: AccessLevel.Admin,
    department: "IT",
    title: "Director",
    id: "654321-987",
    basePay: 140000,
    startDate: new Date("2011-01-01"),
    address: {
      street: "123 Main St",
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
    },
  },
  kent: Person = {
    name: "Kent",
    age: 75,
    accessLevel: AccessLevel.User,
    department: "HR",
    title: "Manager",
    id: "987654-321",
    basePay: 150000,
    startDate: new Date("2010-01-01"),
    address: {
      street: "123 Main St",
      city: "Springfield",
      state: "IL",
      zipCode: "62701",
    },
  },
  leonard: Person = {
    name: "Leonard",
    age: 80,
    accessLevel: AccessLevel.User,
    department: "IT",
    title: "Manager",
    id: "987333-666",
    basePay: 120000,
    startDate: new Date("2013-01-01"),
    address: {
      street: "123 Main St",
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
    },
  };

const employees = {
  alicia,
  bill,
  chuck,
  david,
  eve,
  frank,
  grace,
  heidi,
  ivan,
  jenny,
  kent,
  leonard,
};

const employeesArray = Object.values(employees);
