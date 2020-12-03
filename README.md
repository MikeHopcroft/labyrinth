# Labyrinth

Set operations prototype.


`Labyrinth` is an experimental tool for analyzing network security rules.
It provides a command-line tool for the following scenarios:
* **Policy Explanation** - given a set of rules, explain the allowable network routes.
* **Contract Validation** - determine whether a set of rules constituting a policy satisfies another set of rules defining a contract.
* **Policy Drift** - explain how two policies differ.
* **Rule Attribution** - explanations and different reports attribute behaviors to specific policy rules and policy file line numbers.
* **Detecting Redundant Rules** - detect rules that can be removed from a policy without changing semantics.

`Labyrinth` is currently in the earliest stages of development, so documentation is sparse, and the code stability is uneven. If you are interested in taking a look, we recommend starting with the
[Labyrinth Tutorial](documentation/tutorial.md).

## Building Labyrinth

`Labyrinth` is a [Node.js](https://nodejs.org/en/) project,
written in [TypeScript](https://www.typescriptlang.org/).
In order to use `labyrinth` you must have
[Node](https://nodejs.org/en/download/) installed on your machine.
`prix-fixe` has been tested with Node version [13.7.0](https://nodejs.org/download/release/v13.7.0/).

~~~
% git clone git@github.com:MikeHopcroft/labyrinth.git
% cd labyrinth
% npm install
% npm run compile
~~~

## Documentation, Tools and Samples

`Labyrinth` includes the following applications, samples, and tutorials:
* Labyrinth Tutorial - Coming soon!

## Contributing
Interested in contributing? CONTTRIBUTING.md coming soon!



