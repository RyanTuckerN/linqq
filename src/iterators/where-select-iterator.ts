import { IteratorBase } from "@core/enumerable-base";
import { Predicate, SelectorWithIndex } from "src/types";

export class WhereSelectIterator<TSource, TResult> extends IteratorBase<TSource, TResult> {
  private index = 0;
  constructor(
    source: Iterable<TSource>,
    private predicate: Predicate<TSource> | undefined | null,
    private selector: SelectorWithIndex<TSource, TResult>,
  ) {
    super(source);
  }

  public moveNext(): boolean {
    let result;
    while (!(result = this.sourceIterator.next()).done) {
      if (!this.predicate || this.predicate(result.value)) {
        this.current = this.selector(result.value, this.index++);
        return true;
      }
    }
    return false;
  }

  public clone(): WhereSelectIterator<TSource, TResult> {
    return new WhereSelectIterator<TSource, TResult>(this.source, this.predicate, this.selector);
  }
}
