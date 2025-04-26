import { IteratorBase } from "@core/enumerable-base";
import { IEnumerable } from "@interfaces/IEnumerable";
import { Predicate } from "src/types";
import { Utils } from "src/util";
import { WhereIterator } from "./where-iterator";

export class WhereSelectArrayIterator<TSource, TOut> extends IteratorBase<TSource, TOut> {
  private index = 0;
  constructor(
    protected source: TSource[],
    private _predicate: Predicate<TSource> | undefined | null,
    private _selector: (item: TSource, index: number) => TOut,
  ) {
    super(source);
  }

  public moveNext(): boolean {
    while (this.index < this.source.length) {
      const item = this.source[this.index++];
      if (!this._predicate || this._predicate(item)) {
        this.current = this._selector(item, this.index - 1);
        return true;
      }
    }
    return false;
  }

  public clone(): IteratorBase<TSource, TOut> {
    return new WhereSelectArrayIterator(this.source, this._predicate, this._selector);
  }

  public override select<TNext>(selector: (x: TSource, i: number) => TNext): IEnumerable<TNext> {
    if (this._selector.length === 1) {
      return Utils.cast<IEnumerable<TNext>>(
        new WhereSelectArrayIterator(
          this.source,
          this._predicate,
          Utils.combineSelectors(this._selector as any, selector as any),
        ),
      );
    }
    return super.select(selector);
  }

  public override where(predicate: (x: TSource) => boolean): IEnumerable<TSource> {
    return new WhereIterator(Utils.cast(this), predicate);
  }
}
