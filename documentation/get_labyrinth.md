# Get Labyrinth!

`Labyrinth` is a [Node.js](https://nodejs.org/en/) project,
written in [TypeScript](https://www.typescriptlang.org/).
In order to use `labyrinth` you must have
[Node](https://nodejs.org/en/download/) installed on your machine.
`labyrinth` has been tested with Node version [13.7.0](https://nodejs.org/download/release/v13.7.0/).

## Installing Labyrinth from NPM

Install `labyrinth`:

~~~
$ npm install -g labyrinth-nsg
~~~

This will install the `labyrinth` tool in your global npm cache.
`labyrinth` should be on the path in your shell. To test your installation try

~~~
$ labyrinth version
~~~

If you plan to follow the tutorial steps, download the samples:

[//]: # (script samples)
~~~
$ samples 
https://raw.githubusercontent.com/MikeHopcroft/labyrinth/main/data/azure/examples/00.demo/resource-graph.json
https://raw.githubusercontent.com/MikeHopcroft/labyrinth/main/data/azure/examples/00.demo/convert.yaml
https://raw.githubusercontent.com/MikeHopcroft/labyrinth/main/data/azure/examples/01.graph-basic-vnet/resource-graph.json
https://raw.githubusercontent.com/MikeHopcroft/labyrinth/main/data/azure/examples/01.graph-basic-vnet/convert.yaml
https://raw.githubusercontent.com/MikeHopcroft/labyrinth/main/data/azure/examples/02.graph-multi-subnet/resource-graph.json
https://raw.githubusercontent.com/MikeHopcroft/labyrinth/main/data/azure/examples/02.graph-multi-subnet/convert.yaml
https://raw.githubusercontent.com/MikeHopcroft/labyrinth/main/data/azure/examples/03.graph-internal-load-balancer/resource-graph.json
https://raw.githubusercontent.com/MikeHopcroft/labyrinth/main/data/azure/examples/03.graph-internal-load-balancer/convert.yaml
https://raw.githubusercontent.com/MikeHopcroft/labyrinth/main/data/azure/examples/04.graph-load-balancers/resource-graph.json
https://raw.githubusercontent.com/MikeHopcroft/labyrinth/main/data/azure/examples/04.graph-load-balancers/convert.yaml
https://raw.githubusercontent.com/MikeHopcroft/labyrinth/main/data/azure/examples/05.graph-vmss/resource-graph.json
https://raw.githubusercontent.com/MikeHopcroft/labyrinth/main/data/azure/examples/05.graph-vmss/convert.yaml
https://raw.githubusercontent.com/MikeHopcroft/labyrinth/main/data/azure/examples/06.graph-internet-routing/resource-graph.json
https://raw.githubusercontent.com/MikeHopcroft/labyrinth/main/data/azure/examples/06.graph-internet-routing/convert.yaml
https://raw.githubusercontent.com/MikeHopcroft/labyrinth/main/data/azure/examples/07.graph-multiple-vnet/resource-graph.json
https://raw.githubusercontent.com/MikeHopcroft/labyrinth/main/data/azure/examples/07.graph-multiple-vnet/convert.yaml
https://raw.githubusercontent.com/MikeHopcroft/labyrinth/main/data/azure/examples/08.graph-overlapping-vnet/resource-graph.json
https://raw.githubusercontent.com/MikeHopcroft/labyrinth/main/data/azure/examples/08.graph-overlapping-vnet/convert.yaml
https://raw.githubusercontent.com/MikeHopcroft/labyrinth/main/data/azure/examples/09.graph-load-balancer-outbound-rules/resource-graph.json
https://raw.githubusercontent.com/MikeHopcroft/labyrinth/main/data/azure/examples/09.graph-load-balancer-outbound-rules/convert.yaml
Samples downloaded to samples.

~~~


## Building Labyrinth from Sources

Eventually, `labyrinth` will be available as an [npm](https://www.npmjs.com) package. Until then, the only way to get `labyrinth` is to build it from sources. Here are the steps:

~~~
% git clone git@github.com:MikeHopcroft/labyrinth.git
% cd labyrinth
% npm install
% npm run compile
~~~

You can test your build by running the unit test suite:

~~~
$ npm run test

> labyrinth@0.0.0 pretest D:\git\labyrinth
> npm.cmd run compile


> labyrinth@0.0.0 compile D:\git\labyrinth
> tsc


> labyrinth@0.0.0 test D:\git\labyrinth
> mocha 'build/test/**/*.js'



  DimensionType
    invalid
      √ Key is not legal Javascript identifer.
      √ Key is reserved word.
      √ Symbol is not legal Javascript identifer.
      √ Symbol is reserved word.
      √ Cycle in definition chain.
      √ Unknown parser.
      √ Unknown formatter.
    lookup()
      √ Unknown symbol
      √ Simple definition
      √ Definition chain
      √ Complex chain

  Formatters
    ip
      createIpFormatter()
        √ CIDR block
        √ Range (not CIDR block)
        √ Single ip address
      formatDRange + ipFormatter
        √ No symbols
        √ Symbols for indivdual ips
        √ Symbols for ip ranges
        √ Symbol for entire range
    Number/Symbol
      formatDRange + NumberSymbolFormatter
        √ No symbols
        √ Symbols for indivdual numbers
        √ Symbols for numeric ranges
        √ Symbol for start of numeric range
        √ Symbol for entire range

  Parser
    parseIpSet
      √ invalid
      √ any
      √ single address
      √ address range
      √ CIDR
      √ address list
      √ except address list
    parsePortSet
      √ invalid
      √ any
      √ single port
      √ single port - hexidecimal
      √ port range
      √ port list
    parseProtocolSet
      √ invalid
      √ any
      √ single numeric protocol
      √ single numeric protocol - hexidecimal
      √ single symbolic protocol
      √ numeric protocol range
      √ symbolic protocol range
      √ protocol list

  Rules
    Loaders
      √ loadCsvRulesString()
      √ loadYamlRulesString()
    denyOverrides()
      √ test()
    firstApplicable()
      √ test()
      √ test2()

  Conjunction
    √ intersect()
    √ complement()
    create()
      √ parameter validation
      √ X & 0 = 0
      √ X & 1 = X
    predicates
      √ isEmpty()
      √ isUniverse()

  DimensionedRange
    √ constructor validates range
    √ isEmpty()
    √ isUniverse()
    √ intersect()
    √ union()
    √ complement()

  Disjunction
    create()
      √ X + 1 = 1
      √ X + 0 = X
    intersect()
      √ intersect(): X & Y
      √ intersect(): X & 0
      √ intersect(): X & 1
    predicates
      √ isEmpty()
      √ isUniverse()

  Simplifier
    √ createConjunctionInfo
    simplify()
      √ first
      √ (a+b)(c+d)
      √ (a+b)(a+b)
      √ chain

  Utilities
    √ crossProduct()


  75 passing (68ms)


> labyrinth@0.0.0 posttest D:\git\labyrinth
> npm.cmd run lint


> labyrinth@0.0.0 lint D:\git\labyrinth
> gts lint

version: 13
~~~

---
### [Next: Analyzing Azure Resource Graphs](./azure_resource_graph.md)