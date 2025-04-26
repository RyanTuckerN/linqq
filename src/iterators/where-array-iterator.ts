import { IteratorBase } from "@core/enumerable-base";
import { IEnumerable } from "@interfaces/IEnumerable";
import { Predicate, PredicateWithIndex, SelectorWithIndex } from "src/types";
import { Utils } from "src/util";
import { WhereSelectArrayIterator } from "./where-select-array-iterator";

export class WhereArrayIterator<TSource> extends IteratorBase<TSource> {
  private index = 0;
  constructor(
    protected source: TSource[],
    private _predicate: Predicate<TSource>,
  ) {
    super(source);
  }

  public get predicate(): Predicate<TSource> {
    return this._predicate;
  }

  public moveNext(): boolean {
    while (this.index < this.source.length) {
      const item = this.source[this.index++];
      if (this._predicate(item)) {
        this.current = item;
        return true;
      }
    }
    return false;
  }

  public clone(): IteratorBase<TSource> {
    return new WhereArrayIterator(this.source, this._predicate);
  }

  public override where(predicate: Predicate<TSource> | PredicateWithIndex<TSource>): IEnumerable<TSource> {
    if (predicate.length > 1) return super.where(<PredicateWithIndex<TSource>>predicate);
    return new WhereArrayIterator(this.source, Utils.combinePredicates(this._predicate, <Predicate<TSource>>predicate));
  }

  public override select<TOut>(selector: SelectorWithIndex<TSource, TOut>): IEnumerable<TOut> {
    return Utils.cast<IEnumerable<TOut>>(new WhereSelectArrayIterator(this.source, this._predicate, selector));
  }
}
