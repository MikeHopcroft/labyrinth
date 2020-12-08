# Defining Universes

All `labyrinth` analysis happens in the context of a `Universe`. The `Universe` defines the `types` and `dimensions` used to express policy rules.

`labyrinth` includes [a sample Universe definition for firewalls](../src/spec/../../../../build/src/specs/firewall.js). 

## Defining the Universe

A universe consists of a set of `Dimensions`, each of which is associated with a `Type`.

~~~yaml
types: [
  # Type definitions here
],
dimensions: [
  # Dimension definitions here reference types
  # defined in previous section.
]
~~~

## Set Expressions
This section coming soon. Synopsis:
* literals - numbers, ip addresses, ip CIDRs
* ranges
* symbols
* reserved words
* note on cyclic dependencies

## Formatters and Parsers
This section coming soon. Synopsis:
* ip addresses
* numbers
* pluggable formatters and parsers

## Defining Types

In `labyrinth`, all assertions are encoded as sets of integers within some [min,max] domain.

A type definition includes
* **name -** a friendly name for the type, to be used in error messages.
* **key -** a symbolic key, used by dimensions to refer to their type.
* **parser -** the name of a parsing strategy for literals of this type. `labyrinth` provides two parsing strategies: `ip`, and `default`. The first parses expressions involving symbols and ip addresses. The second parses expressions involving symbols and numbers. 
* **formatter -** the name of an output formatter for values of this type.`labyrinth` provides two formatters: `ip`, and `default`.
* **domain -** the [min,max] range of integer values associated with this type. Note that the domain can be expressed in any format compatible with the associated parser. Therefore, the ip address can be `0.0.0.0-255.255.255.255` or `0.0.0.0/0` and the port can be `0-0xffff`.
* **values -** a table of key-value pairs defining symbols for this type. These symbols will be accepted by the parser and displayed by the formatter. Note that symbols must be legal Javascript identifiers and cannot be one of the `labyrinth` reserved symbols (`any`, `*`, `except`, `allow`, `permit`, `deny`, `action`, `line`, `id`, `priority`). A value can be any legal expression.

Here is an excerpt of the firewall universe type definitions from `src/specs/firewall.hs`:
~~~yaml
types: [
  {
    name: 'ip address',
    key: 'ip',
    parser: 'ip',
    formatter: 'ip',
    domain: '0.0.0.0-255.255.255.255',
    values: [
      {symbol: 'internet', range: '0.0.0.0-255.255.255.255'},
      {symbol: 'localhost', range: '127.0.0.1'},
      {symbol: 'loopback', range: '127.0.0.0/8'},
    ],
  },
  {
    name: 'port',
    key: 'port',
    parser: 'default',
    formatter: 'default',
    domain: '00-0xffff',
    values: [
      {symbol: 'ftp', range: '21'},
      {symbol: 'ssh', range: '22'},
      {symbol: 'telnet', range: '23'},
      # etc.
    ],
  },
  {
    name: 'protocol',
    key: 'protocol',
    parser: 'default',
    formatter: 'default',
    domain: '00-0xff',
    values: [
      {symbol: 'ip', range: 'any'},
      {symbol: 'hopopt', range: '0'},
      {symbol: 'icmp', range: '1'},
      {symbol: 'igmp', range: '2'},
      {symbol: 'ggp', range: '3'},
      {symbol: 'ipv4', range: '4'},
      {symbol: 'st', range: '5'},
      {symbol: 'tcp', range: '6'},
      {symbol: 'cbt', range: '7'},
      {symbol: 'egp', range: '8'},
      {symbol: 'igp', range: '9'},
      {symbol: 'bbn_rcc_mon', range: '10'},
      {symbol: 'nvp_ii', range: '11'},
      {symbol: 'pup', range: '12'},
      {symbol: 'emcon', range: '14'},
      {symbol: 'xnet', range: '15'},
      {symbol: 'chaos', range: '16'},
      {symbol: 'udp', range: '17'},
      # etc.
    ],
  },
  {
    name: 'tcp flags',
    key: 'flags',
    parser: 'default',
    formatter: 'default',
    domain: '0-8',
    values: [
      {symbol: 'FIN', range: '0'},
      {symbol: 'SYN', range: '1'},
      {symbol: 'RST', range: '2'},
      {symbol: 'PSH', range: '3'},
      {symbol: 'ACK', range: '4'},
      {symbol: 'URG', range: '5'},
      {symbol: 'ECE', range: '6'},
      {symbol: 'CWR', range: '7'},
      {symbol: 'NS', range: '8'},
    ],
  },
]
~~~

## Defining Dimensions

A dimension definition contains the following fields:
* **name -** a friendly name for the dimension, to be used in reports.
* **key -** a symbolic key for the dimension, to be used in the `.txt` and `.yaml` rules definitions. Note that the key must be a legal Javascript identifier and cannot be one of the `labyrinth` reserved symbols: (`any`, `*`, `except`, `allow`, `permit`, `deny`, `action`, `line`, `id`, `priority`).
* **type -** the key to this dimension's type definition.

Here is an excerpt of the firewall universe dimension definitions from `src/specs/firewall.hs`:

~~~yaml
dimensions: [
  {
    name: 'source ip',
    key: 'sourceIp',
    type: 'ip',
  },
  {
    name: 'source port',
    key: 'sourcePort',
    type: 'port',
  },
  {
    name: 'destination ip',
    key: 'destinationIp',
    type: 'ip',
  },
  {
    name: 'destination port',
    key: 'destinationPort',
    type: 'port',
  },
  {
    name: 'protocol',
    key: 'protocol',
    type: 'protocol',
  },
]
~~~
