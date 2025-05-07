// tests for idempotence, ie the same request should return the same response (no side effects)

import { linqq as linq } from "../src";
import { IEnumerable } from "../src/interfaces/IEnumerable";

type TestType = { id: number; name: string };
function isIdempotent(expression: (obj: IEnumerable<TestType>) => any) {
  return () => {
    const dataControl = Object.freeze([
      { id: 1, name: "foo" },
      { id: 2, name: "bar" },
      { id: 3, name: "baz" },
    ]);
    const data = [
      { id: 1, name: "foo" },
      { id: 2, name: "bar" },
      { id: 3, name: "baz" },
    ];
    const source = linq(data);
    let result1 = expression(source).toArray();
    let result2 = expression(source).toArray();
    expect(result1).toEqual(result2);
    expect(data).toEqual(source.toArray());
    expect(dataControl).toEqual(data);
  };
}

test(
  "distinct()",
  isIdempotent((x) => x.distinct()),
);
test(
  "distinct()",
  isIdempotent((x) => x.distinct()),
);
test(
  "toList()",
  isIdempotent((x) => x.toList()),
);
test(
  "toList()",
  isIdempotent((x) => x.toList()),
);
test(
  "toDictionary()",
  isIdempotent((x) => x.toDictionary((x) => x.id)),
);
test(
  "toDictionary()",
  isIdempotent((x) => x.toDictionary((x) => x.id)),
);
test(
  "orderBy()",
  isIdempotent((x) => x.orderBy((x) => x.id)),
);
test(
  "orderBy()",
  isIdempotent((x) => x.orderBy((x) => x.id)),
);
test(
  "skipWhile()",
  isIdempotent((x) => x.skipWhile((x) => x.id > 1)),
);
test(
  "skipWhile()",
  isIdempotent((x) => x.skipWhile((x) => x.id > 1)),
);

test(
  "where()",
  isIdempotent((x) => x.where((x) => x.id > 1)),
);
test(
  "where()",
  isIdempotent((x) => x.where((x) => x.id > 1)),
);
test(
  "orderByDescending()",
  isIdempotent((x) => x.orderByDescending((x) => x.id)),
);
test(
  "orderByDescending()",
  isIdempotent((x) => x.orderByDescending((x) => x.id)),
);
test(
  "take()",
  isIdempotent((x) => x.take(2)),
);
test(
  "take()",
  isIdempotent((x) => x.take(2)),
);
test(
  "takeWhile()",
  isIdempotent((x) => x.takeWhile((x) => x.id > 1)),
);
test(
  "takeWhile()",
  isIdempotent((x) => x.takeWhile((x) => x.id > 1)),
);
test(
  "skip()",
  isIdempotent((x) => x.skip(2)),
);
test(
  "skip()",
  isIdempotent((x) => x.skip(2)),
);

test(
  "groupBy()",
  isIdempotent((x) => x.groupBy((x) => x.id).select((g) => g.toArray())),
);
test(
  "groupBy()",
  isIdempotent((x) => x.groupBy((x) => x.id).select((g) => g.toArray())),
);
test(
  "groupJoin()",
  isIdempotent((x) =>
    x.groupJoin(
      x,
      (x) => x.id,
      (x) => x.id,
      (a, b) => a,
    ),
  ),
);
test(
  "groupJoin()",
  isIdempotent((x) =>
    x.groupJoin(
      x,
      (x) => x.id,
      (x) => x.id,
      (a, b) => a,
    ),
  ),
);
test(
  "intersect()",
  isIdempotent((x) => x.intersect(x)),
);
test(
  "intersect()",
  isIdempotent((x) => x.intersect(x)),
);
test(
  "except()",
  isIdempotent((x) => x.except(x)),
);
test(
  "except()",
  isIdempotent((x) => x.except(x)),
);
test(
  "concat()",
  isIdempotent((x) => x.concat(x)),
);
test(
  "concat()",
  isIdempotent((x) => x.concat(x)),
);
test(
  "union()",
  isIdempotent((x) => x.union(x)),
);
test(
  "union()",
  isIdempotent((x) => x.union(x)),
);
test(
  "reverse()",
  isIdempotent((x) => x.reverse()),
);
test(
  "reverse()",
  isIdempotent((x) => x.reverse()),
);

function elementOperationIsIdempotent(expression: (obj: IEnumerable<TestType>) => any) {
  return () => {
    const dataControl = Object.freeze([
      { id: 1, name: "foo" },
      { id: 2, name: "bar" },
      { id: 3, name: "baz" },
    ]);
    const data = [
      { id: 1, name: "foo" },
      { id: 2, name: "bar" },
      { id: 3, name: "baz" },
    ];
    const source = linq(data);
    let result1 = expression(source);
    let result2 = expression(source);
    expect(result1).toEqual(result2);
    expect(data).toEqual(source.toArray());
    expect(dataControl).toEqual(data);
  };
}
test(
  "first()",
  elementOperationIsIdempotent((x) => x.first()),
);
test(
  "first()",
  elementOperationIsIdempotent((x) => x.first()),
);
test(
  "last()",
  elementOperationIsIdempotent((x) => x.last()),
);
test(
  "last()",
  elementOperationIsIdempotent((x) => x.last()),
);
test(
  "single()",
  elementOperationIsIdempotent((x) => x.single((x) => x.id === 1)),
);
test(
  "single()",
  elementOperationIsIdempotent((x) => x.single((x) => x.id === 1)),
);
test(
  "elementAt()",
  elementOperationIsIdempotent((x) => x.elementAt(1)),
);
test(
  "elementAt()",
  elementOperationIsIdempotent((x) => x.elementAt(1)),
);
test(
  "elementAtOrDefault()",
  elementOperationIsIdempotent((x) => x.elementAtOrDefault(1)),
);
test(
  "elementAtOrDefault()",
  elementOperationIsIdempotent((x) => x.elementAtOrDefault(1)),
);
