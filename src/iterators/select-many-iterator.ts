import { IteratorBase } from "@core/enumerable-base";
import { SelectorWithIndex } from "src/types";

export class SelectManyIterator<TSource, TResult> extends IteratorBase<TSource, TResult> {
  private index = 0;
  private innerIterator: Iterator<TResult> | null = null;

  constructor(
    source: Iterable<TSource>,
    private selector: SelectorWithIndex<TSource, Iterable<TResult>>,
  ) {
    super(source);
  }

  public moveNext(): boolean {
    while (true) {
      if (this.innerIterator) {
        const result = this.innerIterator.next();
        if (!result.done) {
          this.current = result.value;
          return true;
        }
        this.innerIterator = null;
      }
      const sourceResult = this.sourceIterator.next();
      if (sourceResult.done) return false;
      const innerIterable = this.selector(sourceResult.value, this.index++);
      this.innerIterator = innerIterable[Symbol.iterator]();
    }
  }

  public clone(): SelectManyIterator<TSource, TResult> {
    return new SelectManyIterator<TSource, TResult>(this.source, this.selector);
  }
}
