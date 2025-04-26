export class Exception extends Error {
  constructor(message: string) {
    super(message);
    this.name = "Exception";
  }
  public static SEQUENCE_EMPTY = "Sequence contains no elements" as const;
  public static NO_MATCH = "Sequence contains no matching element" as const;
  public static SEQUENCE_MULTIPLE = "Sequence contains more than one element" as const;
  public static INDEX_OUT_OF_RANGE = "Index out of range" as const;
  public static ARGUMENT_NULL = (paramName: string) => `Argument ${paramName} cannot be null.` as const;
  public static invalidOperation = (message: string): Exception => new InvalidOperationException(message);
  public static sequenceEmpty = (): Exception => new InvalidOperationException(Exception.SEQUENCE_EMPTY);
  public static moreThanOne = (): Exception => new InvalidOperationException(Exception.SEQUENCE_MULTIPLE);
  public static indexOutOfRange = (): Exception => new IndexOutOfRangeException(Exception.INDEX_OUT_OF_RANGE);
  public static argument = (message: string): Exception => new ArgumentException(message);
  public static argumentNull = (paramName: string): Exception =>
    new ArgumentNullException(Exception.ARGUMENT_NULL(paramName));
  public static noMatch = (): Exception => new ArgumentException(Exception.NO_MATCH);
}

class ArgumentException extends Exception {
  constructor(message: string) {
    super(message);
    this.name = "ArgumentException";
  }
}

class ArgumentNullException extends Exception {
  constructor(message: string) {
    super(message);
    this.name = "ArgumentNullException";
  }
}

class InvalidOperationException extends Exception {
  constructor(message: string) {
    super(message);
    this.name = "InvalidOperationException";
  }
}

class IndexOutOfRangeException extends Exception {
  constructor(message: string) {
    super(message);
    this.name = "IndexOutOfRangeException";
  }
}
