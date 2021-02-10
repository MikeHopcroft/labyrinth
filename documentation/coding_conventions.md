# Coding Conventions

* We use [GTS](https://www.npmjs.com/package/gts) for style checking and linting. The `npm run test` script will run the unit test suite and then [prettier](https://prettier.io/) and [eslint](https://eslint.org/). Use `npm run fix` to attempt to fix most prettier issues.
* We sometimes override eslint on a per-line basis. Overrides should have a comment explaining the rationale for the override.
* Some additional conventions:
  * File names are all lower case and use underscores to separate words.
  * Imports appear at the top of the file, grouped from outermost scope to innermost, and sorted by package name within groups. Scopes for grouping include npm packages, modules from sibling directories, and modules from same directory. Scoping groups are separated by blank lines.
  * Avoiding import dependency cycles.
  * Multi-line import statements are separated from other imports by blank lines before and after.
  * We don't use [JSDoc](https://jsdoc.app/) comments currently.
  * Unit Tests
    * Our unit tests are based on [mocha](https://mochajs.org/) and [chai](https://www.chaijs.com/).
    * We maintain a parallel folder structure for unit tests. In general, the tests for `src/foo/bar.ts` are located in `tests/foo/bar.ts`.
    * We use the [mocha](https://mochajs.org/) `describe()` to organize tests into an appropriate hierarchy.
    * We prefer [chai's](https://www.chaijs.com/) `assert` pattern over `should` and `expect`. In general, we avoid syntactic sugar that makes code read like sentences.
    * We strive to make tests that are resilant to changes in the implementation of the code under test.
* Design
  * We prefer clarity over cleverness and conciseness.
  * In general, we prefer functional over side effects.
  * We target the web browser and node. Therefore we need to be careful about dependencies that might not run in the browser.
  * It is ok to return from the middle of a function if this improves clarity.
* Comments
  * **DESIGN NOTE:** - explains a design decision or pattern that is not obvious. Often includes a stack overflow link. Sometime used to explain linter overrides.
  * **WARNING:** - there be dragons here. Often used to call out a place in the code that is coupled with another place or implementation detail in a non-obvious way. WARNING comments almost always indicate a structural, design issue that should be tracked and rectified.
  * **TODO:** - lightweight task, tempararily introduced during intial framing. Should be addressed in the very near future or moved to an issue.
  * **BUGBUG** - bug or limitation that was intentionally introduced, usually as part of temporary scaffolding. Should be tracked with an issue and eventually resolved.
* Repo
  * We rebase commits to maintain a linear git history. All merges are fast-forward.
  * At present the `main` branch is the only project-wide branch.