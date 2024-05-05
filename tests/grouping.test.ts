import linq from "../src";

test("groupBy()", () => {
  const people = linq(employeesArray);
  const groupedByAccess = people.groupBy((p) => p.accessLevel).toList();
  expect(groupedByAccess.count()).toBe(3);
  const guests = groupedByAccess.single((g) => g.key === AccessLevel.Guest);
  const users = groupedByAccess.single((g) => g.key === AccessLevel.User);
  const admins = groupedByAccess.single((g) => g.key === AccessLevel.Admin);
  expect(guests.count()).toBe(3);
  expect(users.count()).toBe(5);
  expect(admins.count()).toBe(4);
});


enum AccessLevel {
  Guest = 0,
  User = 1,
  Admin = 2,
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
