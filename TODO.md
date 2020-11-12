# TODO

* Figure out ipFormatter unit test regression.
* Indented printing
* Named IP ranges - parsing and formatting
* Common factor simplification
* Print diagnostic information
  * Number of conjunctions
  * Number of DRanges
  * Size of unreduced cross product
* Log diagnostic information
  * High water mark of disjunction sizes
* Formatting utilities for React App
  * Don't want full string - want parts and types
* React App
  * Left Monaco
  * Right Monaco
  * Error pane
  * Update button (with enabled/disabled)
  * Delta pane (tabs for left, right, l-r, and r-l)

* Disjunction
  * x subtract
  * complement
* Conjunction
  * subtract
  * x complement
* x formatter.ts should probably be in rules, not setops.
* Pretty printing
  * Indented printing
  * x Disjunction formatter
  * x Conjunction formatter
  * x Dimension formatter
  * IP formatter
    * x Single ip address
    * x CIDR detection
    * Named range detection
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
* X | 0 = X
* Rules
  * soure ip
  * source port
  * destination ip
  * destination port
  * protocol
  * action: allow/deny
  * priority
  * pretty printing
  * 