///////////////////////////////////////////////////////////////////////////////
//
// Mocking framework code. Read usage examples, below before reading framework.
//
///////////////////////////////////////////////////////////////////////////////
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Mocked<PARAMS extends any[], RESULT> = (...params: PARAMS) => RESULT;

// DESIGN NOTE 1: I would prefer to implement Behavior as a type union of
// a SuccessBehavior and a ThrowBehavior, but I couldn't get it to work with
// the type guards.
//
// DESIGN NOTE 2: Behavior.result should probably have type `string | Error`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Behavior<PARAMS extends any[], RESULT> {
  params: PARAMS;
  message?: string;
  result?: RESULT;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class Mocker<PARAMS extends any[], RESULT> {
  private readonly paramToResult = new Map<string, Behavior<PARAMS, RESULT>>();
  private readonly log: Array<Behavior<PARAMS, RESULT>> = [];
  private readonly defaultFunction: Mocked<PARAMS, RESULT> | undefined;

  constructor(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    prototypeFunction: Mocked<PARAMS, RESULT>,
    defaultFunction: Mocked<PARAMS, RESULT> | undefined = undefined
  ) {
    this.defaultFunction = defaultFunction;
  }

  params(...params: PARAMS) {
    return {
      returns: (result: RESULT) => {
        this.paramToResult.set(JSON.stringify(params), {params, result});
      },

      throws: (message: string) => {
        this.paramToResult.set(JSON.stringify(params), {params, message});
      },
    };
  }

  entry() {
    return (...params: PARAMS) => {
      const key = JSON.stringify(params);
      const value = this.paramToResult.get(key);
      if (value) {
        this.log.push(value);
        if (value.message !== undefined) {
          throw new TypeError(value.message);
        }
        return value;
      } else if (this.defaultFunction) {
        const result = this.defaultFunction(...params);
        this.log.push({params, result});
        return result;
      } else {
        const message = 'Missing default function.';
        throw new TypeError(message);
      }
    };
  }

  invocations(): Array<Behavior<PARAMS, RESULT>> {
    return this.log;
  }
}

///////////////////////////////////////////////////////////////////////////////
//
// Usage example
//
///////////////////////////////////////////////////////////////////////////////

// Here is a function we'd like to mock. To build the mock, we need access to
// the function declaration so the framework can infer  the parameter and
// and result types.
function realFunction(a: number, b: number, op: string): number {
  if (op === '+') {
    return a + b;
  } else if (op === '-') {
    return a - b;
  } else if (op === '*') {
    return a * b;
  } else if (op === '/') {
    return a / b;
  } else {
    const message = `Unknown operator "${op}".`;
    throw new TypeError(message);
  }
}

// The first step is to construct an instance of a Mocker, based on the
// function to be mocked. An optional second parameter supplies a default
// mock function. The default mock function will be used for invocations
// that don't match those defined by calls to the params() function below.
const mocker = new Mocker(realFunction);

// The second step is to provide behaviors for select invocations.
// Current behaviors include returning a result and throwing a TypeError.
//
// Right now, one can only register a single result for a particular set
// or parameters.
//
// We could modify this code to define results for successive calls with
// the same parameters, e.g.
//   mocker.params(3, 4, '+').returns([7, 8, 9]);
mocker.params(3, 4, '+').returns(7);
mocker.params(3, 4, '*').returns(11);
mocker.params(5, 0, '/').throws('divide by zero');

// The next step is to grab the mock function.
const mock = mocker.entry();

//
// Here are some invocations.
//

// Returns value provided to mocker.params().results. Prints "7".
console.log(mock(3, 4, '+'));

// Returns value provided to mocker.params().results. Prints "11".
console.log(mock(3, 4, '*'));

// These parameters weren't registered and we didn't provide a default mock
// function as the optional second parameter to Mocker.constructor(), so the
// framework throws.
try {
  console.log(mock(1, 2, '+'));
} catch (e) {
  console.log(e.message);
}

// This case was defined to throw by the call to mocker.params().throw().
try {
  console.log(mock(5, 0, '/'));
} catch (e) {
  console.log(e.message);
}

// After making calls to mock(), we can get back a log of all of the invocation
// details.
console.log(mocker.invocations());

// Here is an example of a default function that could be passed as the
// second parameter to Mocker.constructor().
// eslint-disable-next-line  @typescript-eslint/no-unused-vars
function defaultFunction(a: number, b: number, op: string): number {
  return Number.NaN;
}
