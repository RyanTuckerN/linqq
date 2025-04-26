import { IteratorBase } from "@core/enumerable-base";

export class GeneratorIterator<T> extends IteratorBase<T> {
  constructor(private getSource: () => Iterable<T>) {
    super(getSource());
  }

  public moveNext(): boolean {
    const result = this.sourceIterator.next();
    if (result.done) return false;
    this.current = result.value;
    return true;
  }

  public clone(): GeneratorIterator<T> {
    return new GeneratorIterator(this.getSource);
  }
}
