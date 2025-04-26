import { IteratorBase } from "@core/enumerable-base";
import { IEnumerable } from "@interfaces/IEnumerable";
import { Predicate, PredicateWithIndex } from "src/types";
import { Utils } from "src/util";
import { WhereSelectIterator } from "./where-select-iterator";

export class WhereIterator<TSource> extends IteratorBase<TSource> {
  constructor(
    protected source: IEnumerable<TSource>,
    private _predicate: Predicate<TSource>,
  ) {
    super(source);
  }

  public moveNext(): boolean {
    let result;
    while (!(result = this.sourceIterator.next()).done) {
      if (this._predicate(result.value)) {
        this.current = result.value;
        return true;
      }
    }
    return false;
  }

  public clone(): IteratorBase<TSource> {
    return new WhereIterator(this.source, this._predicate);
  }

  public override where(predicate: Predicate<TSource> | PredicateWithIndex<TSource>): IEnumerable<TSource> {
    if (predicate.length > 1) return super.where(predicate);
    return new WhereIterator(this.source, Utils.combinePredicates(this._predicate, predicate as Predicate<TSource>));
  }

  public override select<TOut>(selector: (x: TSource, i: number) => TOut): IEnumerable<TOut> {
    return Utils.cast<IEnumerable<TOut>>(new WhereSelectIterator(this.source, this._predicate, selector));
  }
}
