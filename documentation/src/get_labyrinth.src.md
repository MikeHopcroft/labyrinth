# Get Labyrinth

`Labyrinth` is a [Node.js](https://nodejs.org/en/) project,
written in [TypeScript](https://www.typescriptlang.org/).
In order to use `labyrinth` you must have
[Node](https://nodejs.org/en/download/) installed on your machine.
`Labyrinth` has been tested with Node version [16.0.0](https://nodejs.org/download/release/v16.0.0/). Most functionality will likely work with version as low as [13.7.0](https://nodejs.org/download/release/v13.7.0/).
Here's how to verify that Node is installed:

[//]: # (spawn node --version)
~~~
$ node --version
v16.0.0
~~~

Once you have Node, you can either install the [labyrinth-nsg](https://www.npmjs.com/package/labyrinth-nsg) package directly from [npm](https://www.npmjs.com), or you can clone and build the [github repo](https://github.com/MikeHopcroft/labyrinth/). Instructions for both methods follow.

## Installing Labyrinth from NPM

Install the [labyrinth-nsg](https://www.npmjs.com/package/labyrinth-nsg) package:

[//]: # (verbatim npm run test)
~~~
$ npm install -g labyrinth-nsg
~~~

This will install the `labyrinth` tool in your global npm cache and add
`labyrinth` the path in your shell. To test your installation try

[//]: # (script labyrinth version)
~~~
$ labyrinth version
labyrinth version 0.0.6

~~~

## Sample Files
This tutorial makes use of a number of sample graph files which reside in the [data](https://github.com/MikeHopcroft/labyrinth/tree/main/data) folder of the the [labyrinth repo](https://github.com/MikeHopcroft/labyrinth/). If you installed [labyrinth-nsg](https://www.npmjs.com/package/labyrinth-nsg) directly from npm, you can use the `labyrinth samples` command to download these files:

[//]: # (verbatim labyrinth samples)
~~~
$ labyrinth samples
Downloading samples
  samples\data\azure\examples\00.demo\resource-graph
  samples\data\azure\examples\00.demo\convert.yaml
  samples\data\azure\examples\01.graph-basic-vnet\resource-graph
  samples\data\azure\examples\01.graph-basic-vnet\convert.yaml
  samples\data\azure\examples\02.graph-multi-subnet\resource-graph
  samples\data\azure\examples\02.graph-multi-subnet\convert.yaml
  samples\data\azure\examples\03.graph-internal-load-balancer\resource-graph
  samples\data\azure\examples\03.graph-internal-load-balancer\convert.yaml
  samples\data\azure\examples\04.graph-load-balancers\resource-graph
  samples\data\azure\examples\04.graph-load-balancers\convert.yaml
  samples\data\azure\examples\05.graph-vmss\resource-graph
  samples\data\azure\examples\05.graph-vmss\convert.yaml
  samples\data\azure\examples\06.graph-internet-routing\resource-graph
  samples\data\azure\examples\06.graph-internet-routing\convert.yaml
  samples\data\azure\examples\07.graph-multiple-vnet\resource-graph
  samples\data\azure\examples\07.graph-multiple-vnet\convert.yaml
  samples\data\azure\examples\08.graph-overlapping-vnet\resource-graph
  samples\data\azure\examples\08.graph-overlapping-vnet\convert.yaml
  samples\data\azure\examples\09.graph-load-balancer-outbound-rules\resource-graph
  samples\data\azure\examples\09.graph-load-balancer-outbound-rules\convert.yaml
Samples downloaded to samples.

~~~


## Building Labyrinth from Sources

You may also clone and build `labyrinth` from sources. Please be aware that the `labyrinth` command is configured on package installation. Since the build process doesn't install the package, the `labyrinth` command won't be configured. To run `labyrinth` from your build, simply type

~~~
$ node build/src/apps/labyrinth.js
~~~

Here are the steps for cloning and building `labyrinth` from sources:
~~~
$ git clone git@github.com:MikeHopcroft/labyrinth.git
$ cd labyrinth
$ npm install
$ npm run compile
~~~

You can verify your build by running the following command:

[//]: # (spawn node build/src/apps/labyrinth.js version)
~~~
labyrinth version 0.0.7

~~~

You can test your build by running the unit test suite:

[//]: # (verbatim npm run test)
~~~
$ npm run test

> labyrinth-nsg@0.0.7 pretest D:\git\labyrinth
> npm run compile


> labyrinth-nsg@0.0.7 compile D:\git\labyrinth
> tsc


> labyrinth-nsg@0.0.7 test D:\git\labyrinth
> mocha



  Azure
    Address Allocator
      √ simple request
      √ simple request, two ids
      √ throw if id requested twice
      √ throws error if same id requested for different subnets
      √ reserved ip is not allocated
    AzureId
      √ Extracts Subscription Id
      √ Extracts Resource Group
      √ Extracts Resource Name
      √ Level 1
      √ Level 2
      √ Level 3
      √ Root
      √ Throws on empty id
      √ Throws not at least valid root
    NameShortener
      √ Unknown key
      √ Duplicate keys
      √ Basic shortening
      √ Constructor param
      √ Reverse mode
    Walk
      √ walkAzureTypedObjects()
      √ walkAzureObjectBases()
    Converters
      √ convertPrivateIp()
      √ Verify VNET Public IP Route
      convertLoadBalancer()
        √ Unconfigured return undefined
        √ load balancer nat rule
        √ Unbound nat rule
        √ internal load balancer with pool rool
      convertNIC()
        √ NIC with NSG and two private ips
        √ Mising VM should result in unbounded node
      convertNsg()
        √ Rules should be sorted in priority order
      convertPublicIp()
        √ support for unbound ip
        √ publicIp with privateIp
        √ publicIp bound to privateIp with no address
        √ isolated publicIp
        √ load balanced public ip
      convertResourceGraph()
        - simple
        √ validate default creation of internet and backbone
      convertSubnet()
        √ Subnet with NSG and one NIC
      convertVM()
        √ VM with two NICs
      convertVNet()
        √ VNet with two subnets
    Synthetics
      √ detection of sythethetic VMSS ip config
      √ detection of sythethetic VMSS network interface
    Normalization
      √ expect lower case "id"
      √ expect lower case "type"
      √ expect lower case "name"
      √ expect lower case "name" on all types

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

  Graph
    Errors
      √ unknown destination
      √ duplicate node key
      √ unknown start point
    Cycles
      √ Simple cycle
      √ Double cycle variant one
      √ Double cycle variant two
      √ Loopback to endpoint is not a cycle
      √ NAT cycle exception
    Forward propagate
      √ Linear unidirectional
      √ Linear bidirectional
      √ Confluence
      √ Upstream shadows downstream
      √ Complex
    Backward propagate
      √ Linear unidirectional - Inbound
      √ Validate overrides will intersect on TO route
      √ Validate overrides intersection and no flow side affects
      √ To node linear with NAT
      √ Linear with two NATs
      √ clearOverride() with impossible override
      √ clearOverride() bug regression
    Filters
      √ Inbound
      √ Inbound: empty filter blocks all routes
      √ Inbound: undefined filter allows all
      √ Inbound and outbound

  Rules
    Loaders
      √ loadCsvRulesString()
      √ loadYamlRulesString()
    denyOverrides()
      √ test()
    firstApplicable()
      √ test()
      √ test2()

  Coalesce
    √ dedupe three
    √ coalesce three terms
    √ coalesce two and three
    √ no coalesce
    √ no coalesce - empty
    √ annihilate

  Setops - Conjunction
    √ intersect()
    √ overrideDimensions()
    √ clearOverrides()
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

  SetOps - Disjunction
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

  test/shared
    √ crossProduct()

  Utilties
    √ removeUndefinedProperties()


  153 passing (121ms)
  1 pending


> labyrinth-nsg@0.0.7 posttest D:\git\labyrinth
> npm run lint


> labyrinth-nsg@0.0.7 lint D:\git\labyrinth
> gts lint

version: 13

~~~


---
### [Next: Analyzing Azure Resource Graphs](./azure_resource_graph.md)