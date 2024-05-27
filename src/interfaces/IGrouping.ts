import { IEnumerable } from "./IEnumerable";

/**
 * Represents an IEnumerable of elements that have a common key.
 */
export interface IGrouping<TKey, TElement> extends IEnumerable<TElement> {
  /**
   * Gets the key of the IGrouping<TKey, TElement>.
   */
  readonly key: TKey;
}
