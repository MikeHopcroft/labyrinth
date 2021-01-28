# TODO

* Top
  * Delete graph
  * Ranme graph2 to graph
  * Finish authoring unit tests
  * Graph analysis utility
* Azure configuration import
  * Library
  * Command-line transformer
* Graph analysis command-line utility
  * -f=node, --from=node
  * -t=node, --to=node
  * Special handling for -f=a -t=b
* Global cycle detection
  * Walk graph from each node
  * Canonical names for cycles to eliminate duplicates
  * Keep one instance of each cycle
    * Instance traverse should start at node on cycle
* Add firewall rules to NodeSpec
  * inbound or filters
  * outbound or filters
* x Pusblish npm package
  * x labyrinth-analysis?
  * x labyrinth-nsg
  * x labyrinth-nsa
  * x labyrinth-security
* x Labyrinth-app/visualizer
  * x Repo
  * x Next project
  * x Skeleton
  * x Monaco editor hosting
* forwardRuleSpecType
  * Solution to avoid name clashes between rule fields and built-in fields. E.g. `destination`, `id`, and `source` in forwardRuleSpecType.
  * In forwardRuleSpecType, field name `source` might be confusing when positioned near destination. Might consider `provenence` or some other word.
  * Why does forwardRuleSpecType need a unique id?
* Transition from Travis to GitHub actions.
  * Implement action
  * Badges

* x Fix cycle detection
  * x Really need dedicated DFS with markers
  * x Print out cycle.
* x Graph from-to reachability
  * x Constructor takes start node and adds to the queue
  * x Initial IPs are specified in local field
* Graph scenarios
  * What routes can get to a node?
  * What routes exist from node a to node b?
  * How can traffic get to a node (i.e. what are earlier hops)?
  * TraceRt
* Formatting for the UniverseDisjunction
* Graph unit test
  * Split flow and then merge. Verify the simplifer runs.
* Graph application
* Rename rules/types
* Rename RuleSpec, etc to FilterRuleSpec, etc.
* x Graph loader
  * x YAML load/parse
  * x Internet node
  * x Spec should be able to specify entry point
* Graph formatter
  * Line number attribution
  * Node attribution
  * x Tracing routes
* Prove lemma about intersection of minimal forms in documentation.
* Add l-shaped region diagram to simplifier documentation
* Document current simplifier algorithm and future directions
* x Deprecate (and remove from build and code coverage)
  * x murmurhash simplifier
  * x stuff directory
  * x telemetry
  * x Conjunction.toString()
  * x Conjunction.numbers()
* x Templatize Conjunction
  * x Reinstate attribution formatter
* Unify rule types (and move rule-related code to rules directory)
  * FilterRule
  * ForwardRule
  * Figure out how Conjunction attribution can hold RuleSpec and ForwardRuleSpec.
* x Move RuleSpec from setOps?
  * x Currently in setOps because disjunctions are labeled with RuleSpecs for attribution/provenance.
* Reserved words
  * Review across the board.
  * Special names "node" and "destination" not allowed in forwardRules.
* Consider graph cycle identification after detection
* Consider option to represent edges in graph spec.
  * This would allow one to save routes for later analysis.
* Refactor for performance
  * repro.ts
    * x Replace universe parameter with simplifier
    * Use equivalent()
  * intersect()
    * Consider adding simplifier parameter
    * Make required at first to find all calls
  * union()
    * Consider adding simplifier parameter
* Simplifier performance
  * Graph reachability
    * LongestPrefix interpretation
  * Heap exhaustion
    * Simplify after each union
      * node build\src\apps\fuzz.js -n=30 -p=0.6
        * Before: runs out of heap during rules evaluation (before simplification)
        * After: runs to completion with 493200 conjunctions (simplifies to 14)
        * There is some question as to whether the resulting expression is correct.
      * node build\src\apps\fuzz.js -n=40 -p=0.6 -m=f
        * Before: runs out of heap during rules evaluation (before simplification)
        * After: runs to completion, suspiciously fast.
        * There is some question as to whether the resulting expression is correct.
      * Possible experiment to verify internal consistency
        * Run rules evaluation with and without simplification and then compare results.
        * Extract and centralize multiple definitions of Evaluator
        * EvaluatorOptions parameter specifies simplification strategry
        * Serialize resulting expressions as allow rules
      * Question: why does simplification after intersection make a difference?
        * Possible lemma is incorrect
        * Possible one argument is not in simplified form
  * Profiler learnings
    * Murmurhash is slower than straight strings
      * Consider keeping a global mapping from string to id
      * Might contribute to excessive memory usage since there is no good way to determine when to free up entries.
    * x fastFormat()
      * x No "except" mode
      * x No symbol lookup
      * x No ip and cidr formatting
      * x node build\src\apps\fuzz.js -n=23 -p=0.6
        * x Before: 11851.830601ms, 12037.721301ms, 11653.452ms
        * x After: 7476.3192ms, 7496.670699ms
    * DimensionedRange constructor does expensive domain check
    * Examine cost of telemetry
    * Some error checks look for items in hash tables
      * addConjunction()
      * removeConjunction()
    * Consider different key indexing strategy
    * Explore optimal frequency for simplification
      * Lemma: the product of two simplified forms is also a simplified form
      * Where do non-simplified forms appear? Unions?
    * Consider faster format
      * Use hex values
      * Don't use string interpolation
      * Use buffers of binary values
    * .gitignore profiler outputs, 0x, 14148.0x, etc.
  * x -p command-line parameter for fuzz.ts
    * Initial gc heap issues were observed with p=0.6.
  * Look for obvious memory leaks
    * Are we holding pointers to previous iteration state?
  * Report complexity of output
    * Number of conjunctions
  * Report running time
  * Define baseline perf cases
  * Define baseline correctness tests
    * Perhaps run both algorithms side by side
  * Implement 64 bit float hashes
  * Implement 64 bit float XOR operation
  * Prime implicant identifiers become hashes
* Sort allowable routes by attribution
* conjuntions.ts
  * // TODO: rename to formatRules() formatRulesAttributions()
* Better error mapping
  * Error: Invalid Record Length: columns length is 2, got 5 on line 4
    at Parser.__onRow (node_modules\csv-parse\lib\index.js:765:11)
* x Documentation generation code from prix-fixe/prepress
* x Detecting redundant rules
* x README.md
* Set up Travis
  * CI badge
* Set up NYC
  * CC badge
* loaders.ts
  * // TODO: REVIEW: why wouldn't CSV be used for DenyOverride?
* disjunction.test.ts
  * // TODO: convenience method
  * const b = Disjunction.create([Conjunction.create([], ignore)]);
  * Other files use this pattern
  * May want analogous method for Conjunction
* Rule attribution
  * x Rule list formatting
      * x Config object selects line number vs rule number
      * x Dealing with policy vs contract rules - what happens when they are comingled?
  * x Fix unit tests
    * x Issue is rules attribution display
      * x Perhaps remove rules from format()?
      * x Perhaps have optional config object with prefix, and showRules?
  * x Consider using DRange instead of Set<number>
    * x Cons: linear time instead of log, could use Set<RuleSpec> instead.
    * x Pros: better formatting, perhaps quicker for small sets, less code
    * . If we use Set<RuleSpec> we can
      * Abstract out id vs line number difference - both can be in RuleSpec
      * x Formatter can still use DRange on line numbers, rule numbers, etc.
      * RuleSpec can either be wrapped by or contain an object with meta data from the parser.
        * Might want to use reserved symbol name class (e.g. starts with _)
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
* x Parser support for 'except'
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

This caueses an out-of-heap error on the commit immediately after 1b80b574fc7d48cd475fc46224cd059b7f78c9d2. This is the commit that adds the initial fuzzer. Size n=10 works.
* n=10: works quickly
* n=25: works after a pause
* n=50: fails
* n=100: fails
~~~
% node build\src\apps\fuzz.js -n=10

... lots of rules ...

  {
    "action": "deny",
    "priority": 1,
    "id": 1,
    "source": "1",
    "sourceIp": "1.218.1.205-100.138.106.128"
  }
]

<--- Last few GCs --->

[26576:000002A1B4DC7B20]    43812 ms: Scavenge 2034.1 (2050.9) -> 2026.0 (2051.6) MB, 5.2 / 0.0 ms  (average mu = 0.132, current mu = 0.101) allocation failure
[26576:000002A1B4DC7B20]    43825 ms: Scavenge 2034.7 (2051.6) -> 2026.7 (2051.9) MB, 5.2 / 0.0 ms  (average mu = 0.132, current mu = 0.101) allocation failure
[26576:000002A1B4DC7B20]    43837 ms: Scavenge 2035.4 (2051.9) -> 2027.3 (2065.6) MB, 5.3 / 0.0 ms  (average mu = 0.132, current mu = 0.101) allocation failure


<--- JS stacktrace --->

==== JS stack trace =========================================

    0: ExitFrame [pc: 00007FF7AB48154D]
Security context: 0x02f732640921 <JSObject>
    1: _add(aka _add) [000000B6648190A9] [D:\git\labyrinth\node_modules\drange\lib\index.js:~77] [pc=000000394B11CEAB](this=0x03ff05fc04b9 <undefined>,0x03d3c2b597a1 <SubRange map = 000001B74BFADEE1>)
    2: intersect [000000BDDDE51089] [D:\git\labyrinth\build\src\setops\disjunction.js:~32] [pc=000000394B125E26](this=0x03b5f157ffb9 <Disjunction map = 00000...

FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
 1: 00007FF7AA870BEF napi_wrap+126287
 2: 00007FF7AA80DF26 v8::base::CPU::has_sse+34950
 3: 00007FF7AA80EBF6 v8::base::CPU::has_sse+38230
 4: 00007FF7AB037FEE v8::Isolate::ReportExternalAllocationLimitReached+94
 5: 00007FF7AB01F741 v8::SharedArrayBuffer::Externalize+785
 6: 00007FF7AAEE67AC v8::internal::Heap::EphemeronKeyWriteBarrierFromCode+1468
 7: 00007FF7AAEF1AF0 v8::internal::Heap::ProtectUnprotectedMemoryChunks+1312
 8: 00007FF7AAEEE5E4 v8::internal::Heap::PageFlagsAreConsistent+3188
 9: 00007FF7AAEE3CF3 v8::internal::Heap::CollectGarbage+1283
10: 00007FF7AAEEA504 v8::internal::Heap::GlobalSizeOfObjects+212
11: 00007FF7AAF227AB v8::internal::StackGuard::HandleInterrupts+907
12: 00007FF7AAC60046 v8::internal::interpreter::JumpTableTargetOffsets::iterator::operator=+7830
13: 00007FF7AB48154D v8::internal::SetupIsolateDelegate::SetupHeap+517453
14: 000000394B11CEAB

D:\git\labyrinth>node build\src\apps\fuzz.js -n=100

~~~
