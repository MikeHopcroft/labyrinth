# TODO

* loaders.ts
  * // TODO: REVIEW: why wouldn't CSV be used for DenyOverride?
* disjunction.test.ts
  * // TODO: convenience method
  * const b = Disjunction.create([Conjunction.create([], ignore)]);
  * Other files use this pattern
  * May want analogous method for Conjunction
* Rule attribution
  * Consider using DRange instead of Set<number>
    * Cons: linear time instead of log, could use Set<RuleSpec> instead.
    * Pros: better formatting, perhaps quicker for small sets, less code
    * If we use Set<RuleSpec> we can
      * Abstract out id vs line number difference - both can be in RuleSpec
      * Formatter can still use DRange on line numbers, rule numbers, etc.
  * x Line numbers from .txt
  * x Line numbers from .csv
  * Line numbers from YAML
    * See https://eemeli.org/yaml/#options
    * How to deal with multiple tags on the same line?
  * Rule specs include line numbers and rule ids.
  * x Rule attribution in Conjunction constructor and algebra
  * Formatting rule attribution
    * Line numbers
    * Rule numbers
* Redundant rules
* README.md
* Set up Travis
  * CI badge
* Set up NYC
  * CC badge
* Which is clearer?
  * 171.64.80.0-171.64.127.255
  * 171.64.80.0/20,171.64.96.0/19
* . Try out more realistic example from paper
* Rule models other than firewall
* Consider JSDoc comments
* x Loader creates sequential priorities
* Bugs
  * Why do sg1.txt and sg1.yaml generate different results?
    * node build\src\apps\analyze.js data\sg1.txt
    * node build\src\apps\analyze.js data\sg1.yaml
  * x Why does simplifier leave unsimplified terms?
    * x node build\src\apps\analyze.js data\sg1.yaml
    * x Issue was use of remove() instead of removeOne().
* simplifier.ts
  * // TODO: replace Dimension[] with DimensionSet object that enforces monotonic ids.
  * // TODO: this is brittle because it may format different than
  * Rework complex logic in combine(). Look at commented out exception.
  * More unit test coverage.
* Fuzzer and benchmarks
* . Cisco-like parser and rules evaluator
* Split lookup table and dimension table
* . Add TCP flags:
  * established - TODO: encode established
  * . RST
  * . ACK
  * . FIN-ACK
  * . PSH-ACK
  * . RST-ACK
  * . URG-ACK
* ? Protocols should not be case-sensitive
* x Symbols should be able to have values like 'all' and '*'
* x Action synonym 'permit'
* Command line utility
  * Command-line switch for firstApplicable vs denyOverride
  * Command line parameters: <universe> <rules1> [rules2] --telemetry
  * Modes/Reports:
    * Compare rules1 and rules2 - drift
    * Test rules2 against rules1 - contract validation
    * Redundant rules
    * Rule attribution (which rule contributed to this expression)
* dimension_types.ts:
  * // TODO: what if multiple symbols define the same range?
  * x // TODO: disallow `action`, `priority`, etc. For dimension keys.
  * x // TODO: Disallow `*`, `any`
  * x // Symbols cannot contain ',' and '-'. Probably not '.'
  * x // https://gist.github.com/mathiasbynens/6334847
  * x // Also unit test cycle detection and symbol chain.
* dimension.ts
  * // TODO: IMPLEMENT
  * x // TODO: check for key collision with Rule: action, priority
  * x // TODO: check for illegal key
* parser.ts
  * // TODO: SubRangeParser does not need separate `lookup` parameter. Can get from DimensionType.
* rules.ts
  * // TODO: Consider moving to Rule.constructor().
* Formatters should display `*` or `any`
  * // TODO: this is brittle because it may format different than
* Unit tests
  * x Tests for DimensionType.lookup() with chained definitions
  * x Tests for DimensionType exceptions
  * Basic boolean principles: ab = ba, a+b=b+a, a(b+c) = ab +bc
  * Shared built-in universe object. Consider for sample as well.
  * Reduce console spew, especially in `(a+b)(c+d)`.
* Parser support for 'except'
* . Print diagnostic information / telemetry
  * x Number of conjunctions
  * x Number of DRanges
  * x Size of unreduced cross product
* Log diagnostic information
  * High water mark of disjunction sizes

* Consider making IdGenerator into a function.
* Consider renaming rules.ts to evaluate.ts
* Use or remove errors.ts
* Replace tslint suppressions with eslint suppressions
* x Rewrite parseRuleSpec() to be data-driven
  * x Refactor parseRuleSpec(), parseIpSet, parsePortSet, parseProtocolSet
  * Rewrite parser unit tests to support data-driven version
* x Single step through unit test "Symbol for numeric range"
* x formatter.ts:   if (symbol !== text) {  // TODO: this seems wrong. Why return text?
* x Unit test parsing with hex literals
* . Universe
  * x Universe class
  * x Concept of keys vs names
  * Disallow keys 'action' and 'priority' in rules and dimensions.
  * Schema check rules.
    * x Correct keys, as defined by universe
    * Accepted types are string (OK) or number (??)
    * x No superfluous keys
  * x IdGenerator class
  * x UniverseSpec
  * x DimensionTypeSpec
  * x DimensionSpec
* x Simplifier should use DimensionSet/Universe object that enforces dimension ordering
  * x Instead of Dimension[]
  * x Might be base class for RulesDimensions
  * x Consider renaming RulesDimensions to something like FireWallDimensions

* x Data-driven formatters
  * x Use reverse lookup tables
* Perhaps don't hard-code all and *. Put them into lookups?
* TODOs in simplifier.ts
* Better naming scheme in simplifier.ts
* x It is easy to add a bogus field like destinationPort instead of destPort
  * x System fails silently
  * x Is validation in place?
  * x https://github.com/gcanti/io-ts/issues/322
* Figure out ipFormatter unit test regression.
  * Investigate why 0.0.0.1 sometimes formats as "1" and other times as "0.0.0.1"
* x Indented printing
* x Named IP ranges - parsing and formatting
* x Common factor simplification
* Formatting utilities for React App
  * Don't want full string - want parts and types
* React App
  * Left Monaco
  * Right Monaco
  * Error pane
  * Diagnostic pane - counts of expressions
  * Update button (with enabled/disabled)
  * Delta pane (tabs for left, right, l-r, and r-l)
  * Consider 2d and 3d universe arrangement visualizer

* Disjunction
  * x subtract
  * complement
* Conjunction
  * subtract
  * x complement
* x formatter.ts should probably be in rules, not setops.
* Pretty printing
  * x Indented printing
  * x Disjunction formatter
  * x Conjunction formatter
  * x Dimension formatter
  * x IP formatter
    * x Single ip address
    * x CIDR detection
    * x Named range detection
  * Protcol formatter
    * Deal with protocol names with dashes, e.g. unit test expects 'ICMP, TCP, UDP, NETBLT-IL, ESP, IPv6-Opts-VISA'
  * x Port forwarder

* Rules file loading
* Data table configuration
  * IANA
  * IP
* Parser
  * Parse 'allow' and 'deny'
  * Check for "Unassigned" protocol. Are there other special cases?
  * Clean up
  * Rules parsing
  * x Handle any and * correctly now that regex for ranges has changed
* Dimensions
  * Revaluate the idea of a reserved dimension
  * x Include dimension name
  * x Include dimension type name
* IP addresses
  * Symbol for IP set
  * Disallow IPv6
  * Disallow 500.500.500.500
  * REVIEW: do we want to use cidr.lastAddress or cidr.firstAddress + cidr.length - 1?
  * x Single IP
  * x IP start-end range
  * x IP CIDR blocks

* DRange
  * Consider replacing drange with something more functional. Currently methods like subtract create side effects.
  * Subranges first class citizens
  * Domain contains check
  * First method
  * Last method
  * Access numbers without copying
  * Access subranges for formatters
* Pretty printing Conjunctions
* Need better handling for empty dimension in conjunction. Issue comes up in complement. The complement of the empty set needs to produce a disjunction of a conjunction that allows any.
* Built in emptyConjunction and universeConjunction constants
* Built in emptyDimension constant
* How do you complement the empty range?
* Conjunction factory: filter out universe terms
* Consider having conjunction constructor or factory sort dimensions by id.
* Strategies to simplify intersection of two disjunctions
  * Common factors?
  * Identical terms?
  * (evens, B) + (odds, B) = (all, B)
  * (X, B) + (Y, B) = (X + Y, B)
* X & 1 = X
* X & 0 = 0
* X | 1 = 1
* x X | 0 = X
* Rules
  * x soure ip
  * x source port
  * x destination ip
  * x destination port
  * x protocol
  * x action: allow/deny
  * x priority
  * x pretty printing

