# linqq

Why use array methods when you can use LINQ?

## Installation

linqq was created as an exercise and is not currently available on npm. To install it, you can clone the repository and build it locally.

```bash
git clone
cd linqq
npm install
npm run build
npm link
```

Then in your project:

```bash
npm link linqq
```


## Usage

linqq provides a fluent API for querying and manipulating data. Here's a basic example:

```typescript
import { linqq } from "linqq";

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

Then import it into your project:

```typescript
import { linqq } from "linqq";
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

const range = linqq.range(1, 10); // Enumerable{ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 }
const repeat = linqq.repeat("hello", 3); // Enumerable{ "hello", "hello", "hello" }
const empty = linqq.empty<number>(); // Enumerable{ }
const from = linqq.from([1, 2, 3, 4, 5]); // Enumerable{ 1, 2, 3, 4, 5 }
```

## API

### Deferred Execution

In keeping with the principle of efficiency, all linqq operations are deferred until necessary. This means that the elements of the sequence are not computed or retrieved until they are enumerated. This can be beneficial when working with large sequences.

```typescript
import { linqq } from "linqq";

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
import { linqq } from "linqq";
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
              .toList()
            }
          </ul>
        </section>
      ))
      .toList()
    }
  </main>
);
```

### Examples

linqq works with any iterable structure

#### `linqq<T>(array: T[]): IList<T>`

Creates a new list with the given array. The IList offers additional methods like `add`, `remove`, `clear`, `insert`

#### `linqq<T>(source: Iterable<T>): IEnumerable<T>`

Creates a new enumerable with the given source.

#### `linqq<T>(new Set([1, 1, 2, 2, 3, 3, 4, 4, 5, 5])): IEnumerable<T>`

Creates a new enumerable with the given set.

#### `linqq<T>(new Map([["a", 1], ["b", 2], ["c", 3]])): IEnumerable<[string, number]>`

Creates a new enumerable with the given map.

#### `linqq<string>("hello world"): IEnumerable<string>`

Creates a new enumerable with the given string.

### Methods

The full interface of the IEnumerable is as follows:

```typescript
export interface IEnumerable<T> extends Iterable<T> {
  // Transformation
  toArray(): T[];
  toList(): IList<T>;
  ensureList(): IList<T>;
  toSet(): Set<T>;
  toHashSet(comparer?: IEqualityComparer<T>): IHashSet<T>;
  toDictionary<TKey, TOut = T>(
    keySelector: Selector<T, TKey>,
    valueSelector?: Selector<T, TOut>,
  ): IDictionary<TKey, TOut> & Indexable<TKey, TOut>;
  cast<TOut>(): IEnumerable<TOut>;
  
  // Aggregation
  aggregate<TAccumulate, TResult>(
    seed: TAccumulate,
    func: (acc: TAccumulate, x: T) => TAccumulate,
    resultSelector?: (acc: TAccumulate) => TResult,
  ): TResult;
  count(predicate?: Predicate<T>): number;
  sum(selector?: NumericSelector<T>): Numeric;
  sum(selector: NumericSelector<T>): Numeric;
  average(selector?: NumericSelector<T>): Numeric;
  average(selector: NumericSelector<T>): Numeric;
  max<TOut extends Comparable>(selector?: Selector<T, TOut>): TOut;
  min<TOut extends Comparable>(selector?: Selector<T, TOut>): TOut;
  
  // Quantifiers
  any(predicate?: Predicate<T>): boolean;
  all(predicate: Predicate<T>): boolean;
  contains(element: T): boolean;

  // Element
  elementAt(index: number): T;
  elementAtOrDefault(index: number): T | undefined;
  first(predicate?: Predicate<T>): T;
  firstOrDefault(predicate?: Predicate<T>): T | undefined;
  last(predicate?: Predicate<T>): T;
  lastOrDefault(predicate?: Predicate<T>): T | undefined;
  single(predicate?: Predicate<T>): T;
  singleOrDefault(predicate?: Predicate<T>): T | undefined;
  append(element: T): IEnumerable<T>;
  reverse(): IEnumerable<T>;

  // Query
  where(predicate: PredicateWithIndex<T>): IEnumerable<T>;
  select<TOut>(selector: SelectorWithIndex<T, TOut>): IEnumerable<TOut>;
  selectMany<TOut>(selector: SelectorWithIndex<T, Iterable<TOut>>): IEnumerable<TOut>;
  join<TInner, TKey, TOut>(
    inner: TInner[] | IEnumerable<TInner>,
    outerKeySelector: Selector<T, TKey>,
    innerKeySelector: Selector<TInner, TKey>,
    resultSelector: (x: T, y: TInner) => TOut,
    comparer?: IEqualityComparer<TKey>,
  ): IEnumerable<TOut>;
  groupJoin<TInner, TKey, TOut>(
    inner: TInner[] | IEnumerable<TInner>,
    outerKeySelector: Selector<T, TKey>,
    innerKeySelector: Selector<TInner, TKey>,
    resultSelector: (x: T, y: IEnumerable<TInner>) => TOut,
    comparer?: IEqualityComparer<TKey>,
  ): IEnumerable<TOut>;
  orderBy(selector: (x: T) => Orderable): IOrderedEnumerable<T>;
  orderByDescending(selector: (x: T) => Orderable): IOrderedEnumerable<T>;
  take(count: number): IEnumerable<T>;
  takeWhile(predicate: PredicateWithIndex<T>): IEnumerable<T>;
  skip(count: number): IEnumerable<T>;
  skipWhile(predicate: PredicateWithIndex<T>): IEnumerable<T>;
  concat(...args: (Iterable<T>)[]): IEnumerable<T>;
  zip<TOut, TSecond = T>(second: Iterable<TSecond>, selector: (f: T, s: TSecond) => TOut): IEnumerable<TOut>;

  // Set
  distinct(): IEnumerable<T>;
  distinctBy<TOut>(selector: Selector<T, TOut>): IEnumerable<T>;
  union(other: T[] | IEnumerable<T>, comparer?: IEqualityComparer<T>): IEnumerable<T>;
  intersect(other: T[] | IEnumerable<T>, comparer?: IEqualityComparer<T>): IEnumerable<T>;
  except(other: T[] | IEnumerable<T>, comparer?: IEqualityComparer<T>): IEnumerable<T>;
  groupBy<TKey, TNext = T>(
    keySelector: Selector<T, TKey>,
    elementSelector?: Selector<T, TNext>,
    comparer?: IEqualityComparer<TKey>,
  ): IEnumerable<IGrouping<TKey, T>>;
  
  [Symbol.iterator](): IterableIterator<T>;
}
```
