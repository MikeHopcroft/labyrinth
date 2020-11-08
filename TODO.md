# TODO

* Parser
  * Clean up
  * Handle any and * correctly now that regex for ranges has changed
* Dimensions
  * Include dimension name
  * Include dimension type name
* IP addresses
  * Single IP
  * IP start-end range
  * IP CIDR blocks
  * Symbol for IP set
  * REVIEW: do we want to use cidr.lastAddress or cidr.firstAddress + cidr.length - 1
  * Disallow IPv6

* DRange
  * Consider replacing drange with something more functional. Currently methods like subtract create side effects.
  * Domain contains check
  * First method
  * Last method
  * Access numbers without copying
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
