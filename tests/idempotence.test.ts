// tests for idempotence, ie the same request should return the same response (no side effects)

import linq from "../src";
import { IEnumerable } from "../src/interfaces/IEnumerable";

type TestType = { id: number; name: string };
function isIdempotent(expression: (obj: IEnumerable<TestType>) => any) {
  return () => {
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
  };
}

test("distinct()", isIdempotent((x) => x.distinct()));
test("toList()", isIdempotent((x) => x.toList()));
test("toDictionary()", isIdempotent((x) => x.toDictionary(x => x.id)));
test("orderBy()", isIdempotent((x) => x.orderBy(x => x.id)));
test("skipWhile()", isIdempotent((x) => x.skipWhile(x => x.id > 1)));

// test("where()", isIdempotent((x) => x.where(x => x.id > 1)));
// test("orderByDescending()", isIdempotent((x) => x.orderByDescending(x => x.id)));
// test("take()", isIdempotent((x) => x.take(2)));
// test("takeWhile()", isIdempotent((x) => x.takeWhile(x => x.id > 1)));
// test("skip()", isIdempotent((x) => x.skip(2)));

