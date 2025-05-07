# linqq

_Why use arrays when you can use **linqq**?_

## Usage

linqq provides a fluent API for querying and manipulating data. Here's a basic example:

```typescript
import linqq from "linqq";

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const result = linqq(numbers)
  .where((x) => x % 2 === 0)
  .toArray();

console.log(result); // [2, 4, 6, 8, 10]
```

linqq is heavily inspired by Microsoft's LINQ (Language Integrated Query) and provides a similar API for working with data in JavaScript and TypeScript. It offers a wide range of methods for querying, transforming, and aggregating data, making it easy to work with collections of objects, arrays, sets, and maps.

## Features

- **Fluent API**: linqq provides a fluent API for querying and manipulating data.
- **Deferred Execution**: Operations are deferred until necessary, improving performance.
- **Type Safety**: linqq is written in TypeScript and designed with type safety in mind.
- **Iterable Support**: linqq works with any iterable structure, including arrays, sets, and maps.

## Getting Started

To get started with linqq, install it via npm:

```bash
npm install linqq
```

Then import it in your project files:

```typescript
import linqq from "linqq";
```

You can then use the `linqq` function to create an enumerable from an array, set, map, or other iterable structure:

```typescript
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const result = linqq(numbers)
  .where((x) => x % 2 === 0)
  .toArray();

console.log(result); // [2, 4, 6, 8, 10]
```

You can also create/instantiate an enumerable with some static methods:

```typescript
import { Enumerable } from "linqq";

const rangeLinqq = Enumerable.range(1, 10); // Enumerable{ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 }
const repeatLinqq = Enumerable.repeat("hello", 3); // Enumerable{ "hello", "hello", "hello" }
const emptyLinqq = Enumerable.empty<number>(); // Enumerable{ }
const fromLinqq = Enumerable.from([1, 2, 3, 4, 5]); // Enumerable{ 1, 2, 3, 4, 5 }
```

By default, you must pass an iterable source to the `linqq` function. However, you can easily extend the Array prototype to easily access `linqq` functionality:

```typescript
import linqq from "linqq";

// Add this near the root of your project
declare global {
  interface Array<T> {
    /**
     * Convert the Array to an Enumerable.
     * @returns An Enumerable from the Array.
     */
    toEnumerable(): IEnumerable<T>;
  }
}

Array.prototype.toEnumerable = function () {
  return linqq(this);
};
```

Similarly, you can easily extend the Set and Map prototypes:

```typescript
import linqq from "linqq";

// Add this near the root of your project
declare global {
  interface Set<T> {
    /**
     * Convert the Set to an Enumerable.
     * @returns An Enumerable from the Set.
     */
    toEnumerable(): IEnumerable<T>;
  }

  interface Map<K, V> {
    /**
     * Convert the Map to an Enumerable.
     * @returns An Enumerable from the Map.
     */
    toEnumerable(): IEnumerable<[K, V]>;
  }
}

Set.prototype.toEnumerable = function () {
  return linqq(this);
};

Map.prototype.toEnumerable = function () {
  return linqq(this);
};
```

## API

### Deferred Execution

In keeping with the principle of efficiency, all linqq operations are deferred until necessary. This means that the elements of the sequence are not computed or retrieved until they are enumerated. This can be beneficial when working with large sequences.

```typescript
import linqq from "linqq";

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
let query = linqq(numbers)
  .where((x) => x % 2 === 0)
  .select((x) => x * 2); // no iteration yet

if (true) {
  query = query.skip(2).take(2); // still no iteration
}

const resultList = query.toList(); // trigger iteration/materialization

const firstOrDefault = query.firstOrDefault(); // trigger iteration/materialization

const resultArray = query.toArray(); // trigger iteration/materialization and transform to array
```

### React

linqq can be used in React components to manipulate data before rendering. Here's an example:

```tsx
import linqq from "linqq";
import React from "react";

export const Users = ({ users }) => (
  <main>
    {linqq(users)
      .groupBy(({ department, title }) => `${department} - ${title}`)
      .select((group) => (
        <section key={group.key}>
          <h2>{group.key}</h2>
          <ul>
            {group
              .orderBy((user) => user.name)
              .select((user) => <li key={user.id}>{user.name}</li>)
              .toList()}
          </ul>
        </section>
      ))
      .toList()}
  </main>
);
```
