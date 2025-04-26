import { IEnumerable } from ".";

/**
 * Represents a list of elements that can be accessed by index.
 * All methods from IEnumerable are available, with additional methods for adding, removing, and modifying elements.
 * @template T The type of elements in the list.
 */
export interface IList<T> extends IEnumerable<T> {
  /**
   * Determines the index of a specific item in the List.
   * @param element The object to locate in the List.
   * @returns The index of item. If item is not found in the List, returns -1.
   */
  indexOf(element: T): number;
  /**
   * Inserts an element into the List at the specified index.
   * @param index The zero-based index at which item should be inserted.
   * @param element The object to insert.
   */
  insert(index: number, element: T): void;
  /**
   * Removes the element at the specified index of the List.
   * @param index The zero-based index of the element to remove.
   */
  removeAt(index: number): void;
  /**
   * Gets the element at the specified index.
   * @param index The zero-based index of the element to get or set.
   */
  get(index: number): T;
  /**
   * Sets the element at the specified index.
   * @param index The zero-based index of the element to get or set.
   * @param element The object to set.
   */
  set(index: number, element: T): void;
  /**
   * Determines if the List is empty.
   * @returns true if the List is empty; otherwise, false.
   */
  isEmpty(): boolean;
  /**
   * Adds an element to the end of the List.
   * @param element The object to add to the List.
   * @returns true if item is added to the List; otherwise, false.
   */
  add(element: T): boolean;
  /**
   * Adds the elements of the specified collection to the end of the List.
   * @param elements The collection whose elements should be added to the end of the List.
   * @returns The number of elements added to the List.
   */
  addRange(elements: Iterable<T> | T[]): number;
  /**
   * Removes the first occurrence of a specific object from the List.
   * @param element The object to remove from the List.
   * @returns true if item was successfully removed from the List; otherwise, false.
   */
  remove(element: T): boolean;
  /**
   * Removes all elements from the List.
   */
  clear(): void;
  /**
   * Performs the specified action on each element of the List.
   * @param action A function that accepts an argument; the function to perform on each element of the List.
   */
  forEach(action: (element: T, index: number, list: this) => void): void;
  /**
   * Gets the number of elements contained in the List.
   */
  length: number;
  [index: number]: T;
}
