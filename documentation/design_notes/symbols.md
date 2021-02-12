# Design Note on Naming

This note covers naming issues for `symbols` and `dimension keys`.

## Symbols in Dimension Contraint Expressions
Labyrinth includes the concept of symbols in Dimension constraint expressions. In the example, below, `"Internet"` and `"tcp"` are symbols that represent sets of values on the `sourceIp` and `protocol` dimensions.

~~~
sourceIp: Internet
protocol: tcp
~~~

Currently we place a number of restrictions on symbols:
* Cannot contain `"-"`. The hyphen or dash character is reserved for the range operator that separates the start and end of a range, e.g. `"port: 1-5"`.
* Cannot contain `","`. The comma character is reserved for the union operator, e.g. `"port: 80, 443"`.
* Is not the reserved word, `"all"`.
* Is not the reserved symbol, `"*"`.
* Is unique among symbols.

When importing Azure resource graphs, it would be desireable to define symbols for each subnet and nic. The challenge is that some Azure name, particularly those that contain guids, are not legal symbols because of the dashes:

~~~
data.nic.b367ee68-39d3-47ca-8592-c233fb2fee4a/blob-blob.privateEndpoint
~~~

### Idea 1 - Escape illegal characters

* Modify the constraint expression language to handle escaping of dashes.
* Modify import code to escape symbols.
* Modify reporting code to unescape symbols.

### Idea 2 - Use a different character to indicate ranges

* Example using parentheses: `"1-5"` ==> `"(1,5)"`
* Example using elipses: `"1-5"` ==> `"1...5"`.

### Idea 3 - Require white space around operators

* This is a symbol: `"a-b"`.
* This is a range: `"a - b"`.

### Idea 4 - Require that converters not produce illegal symbols

* Azure importer might replaces `"-"` with `"_"`.
* Users would have to understand that symbol names weren't exactly the same.

## Dimension Keys

Labyrinth currently uses dimension keys in dimension constrain expressions. In the following example, `"sourceIp"`, `"protocol"`, and `"port"` are dimension keys:
~~~
rules:
  - action: allow
    priority: 1
    sourceIp: except localhost
    protocol: tcp
    port: 80, 443
~~~

Currently we place a number of restrictions on dimension keys:
* Must be legal Javascript identifiers. This is necessary as we use them for object properties. In general the constraint mean the key must start with non-numeric character and not include characters that are Javascript operators, e.g. `"."`, `","`, and `"/"`. The `isValidIdentifier()` function use a complicated regex (from https://gist.github.com/mathiasbynens/6334847).
* Cannot be one of the `RuleSpecReservedWords`:
  * `"action"`
  * `"id"`
  * `"priority"`
  * `"source"`
* Cannot be one of the `ForwardRuleSpecReservedWords`:
  * `"destination"`
  * `"id"`
  * `"source"`

One challenge with the use of reserved words is that they are hard to maintain. Whenever we add another property to `RuleSpec` or `ForwardRuleSpec`, we need to add it to the corresponding list of reserved words.

### Idea 1 - Put dimension keys in their own sub object

This approach makes the `RuleSpec` and `ForwardRuleSpec` slightly more verbose, but removes the need for reserved word lists.

~~~
rules:
  - action: allow
    priority: 1
    constraints:
      sourceIp: except localhost
      protocol: tcp
      port: 80, 443
~~~
