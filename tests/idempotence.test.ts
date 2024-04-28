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
    const result1 = expression(source).toArray();
    const result2 = expression(source).toArray();
    expect(result1).toEqual(result2);
  };
}

test('sus' , () =>{
  expect(1).toBe(1) // TODO:
})
