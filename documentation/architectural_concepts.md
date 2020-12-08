# Labyrinth Architectural Concepts

`Labyrinth` takes a straightforward approach to representing and reasoning about policies as expressions in [the Algebra of Sets](https://en.wikipedia.org/wiki/Algebra_of_sets). It does not make use of 
[SMT Solvers](https://en.wikipedia.org/wiki/Satisfiability_modulo_theories) or 
[Binary Decision Diagrams](https://en.wikipedia.org/wiki/Binary_decision_diagram).

Each run of Labyrinth performs the following sequence of steps:
* [Parse](#parsing-rules) rules that make up policy.
* [Represent](#representing-rules) each rule as a intersection of sets.
* [Combine](#combining-rules) rules into a single expression in [Disjunctive Normal form](https://en.wikipedia.org/wiki/Disjunctive_normal_form), using either the Deny-Overrides or First Applicable interpretation.
* [Simplify](#simplification-strategies) this expression, using the [Quine-McCluskey Algorithm](https://en.wikipedia.org/wiki/Quine%E2%80%93McCluskey_algorithm) and the 
[identity](https://en.wikipedia.org/wiki/Algebra_of_sets#The_fundamental_properties_of_set_algebra) and
[domination](https://en.wikipedia.org/wiki/Algebra_of_sets#Some_additional_laws_for_unions_and_intersections) laws from 
[set algebra](https://en.wikipedia.org/wiki/Algebra_of_sets).
* [Format](#formatting) the expression for human readers.
* [Generate](#report-generation) report.

To understand these steps, it is help to understand the concept of the
[Universe](#the-universe), a structure that defines the set-theoretic context in which all processing occurs.

## The Universe

### Routes
Routes in `labyrinth` are represented as tuples of integers in an _n_-dimensional space, defined by the `Universe`. Each dimension corresponds to a routing concept like source ip address, port, or protocol.
Consider the 5-dimensional universe defined in [firewall.js](../src/specs/firewall.ts).
This universe defines the following dimensions:
* sourceIp - source ip address, represented as an integer in the range from `0` to `0xffffffff`.
* sourcePort - source port in the range from `0` to `65535`.
* destinationIp - destination ip addresss, represented as an integer in the range from `0` to `0xffffffff`.
* destinationPort - destination port in the range from `0` to `65535`.
* protocol - internet protocol number in the range from `0` to `255`.

The route `(0x0a000002, 49152, 0xab404002, 443, 6)` represents a packet
* originating from port `49152` on ip address `10.0.0.2 (0x0a000002)`
* targeting port `443` at ip address `172.64.64.2 (0xab404002)`
* using protocol number `6 (tcp)`.

### Rules 
Rules in `labyrinth` consist of assertions of membership in a collection of sets.
Consider the following rule with three assertion:
~~~
soureIp: except 10.0.0.0/8
destinationIp: 171.64.64.0/18
destinationPort: 80, 443
protocol: tcp
~~~

This rule consists of four explicit assertions:
* The first assertion corresponds to those source IP addresses _outside_ the `10.0.0.0/8` [CIDR block]((https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing)) -
in other words, those addresses not between `10.0.0.0` and `10.255.255.255`. This corresponds two ranges of source IP addresses - those from `0.0.0.0` to `9.255.255.255` and those from `11.0.0.0` to `255.255.255.255`. These can be expressed as the integer ranges
`[0, 0x09ffffff]` and `[0x0b000000, 0xffffffff]`.
* The second assertion corresponds to those destination IP addresses _inside_ the `171.64.64.0/18` CIDR. These are addresses in the integer range
`[0xab404000, 0xab40bfff]`.

## Parsing Rules

_**THIS SECTION COMING SOON**_

Rule parsing and policy analysis are performed in the context of a [Universe](./defining_universes.md) . . .

## Representing Rules

_**THIS SECTION COMING SOON**_

* [The Algebra of Sets](https://en.wikipedia.org/wiki/Algebra_of_sets)
* [Disjunctive Normal form](https://en.wikipedia.org/wiki/Disjunctive_normal_form)
* Conjunction of sets on dimensions
* Dimensions are subsets of [min,max] ranges of integers

## Combining Rules

_**THIS SECTION COMING SOON**_

## Simplification Strategies

`Labyrinth` uses two expression simplification strategies.
The first is to apply basic algebraic _identity_ and _domination_ laws after each union or intersection operation.
The second is to perform a prime-implicant elimination using the
[Quine–McCluskey algorithm](https://en.wikipedia.org/wiki/Quine%E2%80%93McCluskey_algorithm)

### Basic Algebraic Simplifications

The `labyrinth` set intersection and union operations perform a number of basic algebraic simplifications. In the following, let
* _`D`_ denote the set of all values in the domain
* _`0`_ denote the empty set

Identity
* _`A`_ ⋂ _`D` = `A`_
* _`A`_ ⋃ _`0` = `A`_

Domination
* _`A`_ ⋂ _`0` = `0`_
* _`A`_ ⋃ _`D` = `D`_

Since the expressions are in disjunctive normal form, 
* any term reduced to `0` is eliminated from the overall disjunction
* any term reduced to `D` reduces the entire expression to `D`
* any factor reduced to `D` is eliminated from its conjunction
* any factor reduced to `0` causes its term to become `0` and be eliminated from the overall conjunction.

### Quine–McCluskey Expression Minimization

This strategy combines terms that share the same values on all but on dimension.
For example, the following two terms
~~~
sourceIp: 10.0.0.0/8
destinationIp: 171.64.64.0/18
destinationPort: 80

sourceIp: 10.0.0.0/8
destinationIp: 171.64.64.0/18
destinationPort: 443
~~~
can be combined into a single term:
~~~
sourceIp: 10.0.0.0/8
destinationIp: 171.64.64.0/18
destinationPort: 80, 443
~~~

The [Quine–McCluskey algorithm](https://en.wikipedia.org/wiki/Quine%E2%80%93McCluskey_algorithm) identifies and combines sets of terms that share the same values on all but one dimension. It repeats this process until no more terms can be combined.

## Formatting

_**THIS SECTION COMING SOON**_


## Report Generation

_**THIS SECTION COMING SOON**_

## Suggested Reading

* [Automated Analysis and Debugging of Network
Connectivity Policies](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/secguru.pdf)
* [Validating Datacenters At Scale](https://dl.acm.org/doi/10.1145/3341302.3342094)
* [Enhancements to the Vantage Firewall Analyzer](https://www.hpl.hp.com/techreports/2007/HPL-2007-154R1.pdf)]
* [Binary Decision Diagrams](https://en.wikipedia.org/wiki/Binary_decision_diagram)
* [Satisfiability Modulo Theories](https://en.wikipedia.org/wiki/Satisfiability_modulo_theories)
* [Quine-McCluskey Algorithm](https://en.wikipedia.org/wiki/Quine%E2%80%93McCluskey_algorithm)
* [De Morgan's Laws](https://en.wikipedia.org/wiki/De_Morgan%27s_laws)
* [CIDR Blocks](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing)