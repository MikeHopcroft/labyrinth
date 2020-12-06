# Labyrinth

`Labyrinth` is an experimental tool for analyzing network security rules.
It provides a command-line tool for the following scenarios:
* **Policy Explanation** - given a set of rules, explain the allowable network routes.
* **Contract Validation** - determine whether a set of rules constituting a policy satisfies another set of rules defining a contract.
* **Policy Drift** - explain how two policies differ.
* **Rule Attribution** - reports attribute behaviors to specific policy rules and policy file line numbers.
* **Detecting Redundant Rules** - identify those rules that can be removed from a policy without changing semantics.

`Labyrinth` is currently in the earliest stages of development, so documentation is sparse, and the code stability is uneven. If you are interested in taking a look, we recommend starting with the
[Labyrinth Tutorial](documentation/tutorial.md).

If you are interested in learning more about how `labyrinth` works, please read the
[labyrinth architectural concepts](documentation/architectural_concepts.md).
