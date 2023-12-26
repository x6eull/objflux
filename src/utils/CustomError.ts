export class CustomError extends Error {
}

export class TimeoutError<T> extends CustomError {
  public request: T;
  public label?: string;
  constructor(request: T, label?: string, message = 'Timeout', options?: ErrorOptions) {
    super(message, options);
    this.request = request;
    this.label = label;
  }
}

export class OfTypeError extends CustomError {
}

export class ToolError extends CustomError { }
export class InitError extends ToolError { }
export class ComputeError extends ToolError { }