* Demo/documentation bugs
  * Merge mhop/bugs1 into main

  * Create NPM cli
    * https://developer.okta.com/blog/2019/06/18/command-line-app-with-nodejs
    * https://medium.com/netscape/a-guide-to-create-a-nodejs-command-line-package-c2166ad0452e
    * QUESTION: how to access demo files?

  * Resource graph sanitizer
    * Multiple subscription ids
    * Only copies that which will likely be used
    * Option to generate names for various fields, e.g. name, and id.

  * Update prepress with option to spawn shell
    * USe for getLabyrinth.src.md

  * Improve top-level README.md
  * Azure converter architecture documentation
  * Azure converter pattern documentation
    * IDEA: side-by-side code and explanation like http://gitlet.maryrosecook.com/docs/gitlet.html
  * Azure graph algorithm documentation

  * Remove -s spoofing option
  * Remove Node.range
  * Remove io folder
  * Unit tests for graph are brittle because they are order-sensitive
  * Remove node sort order from graph

  * Consider renaming vm0-vm2 to web0-web2
    * Make separate demo file for docs
    * Rename convert.yaml to graph.yaml
  * SVG diagrams
    * Need to be consistent about SSH, HTTP, TCP casing
    * Remove drop shadow from white background.

  * . Internet node endpoint
    * x InternetBackBone
    * x Internet
    * Private ip ranges: https://en.wikipedia.org/wiki/Private_network
      * 10.0.0.0/8
      * 172.16.0.0/12
      * 192.168.0.0/16

  * Cleanup
    * buildInboundOutboundNodes() params. Why are some optional?
    * setops/formatting.ts
    * writefilesync()

  * Node ranges
    * x Add for Internet, VNet, SubNet, PublicIp, PrivateIp
    * x Display ranges in app
    * Range formatting should not do symbol lookup
    * Remove extra space before (endpoint) - appears when range is undefined.
    * Perhaps range should be a DimensionedRange, instead of a Constraint.
      * ISSUE: graph module should not need to know anything about the type of the Range.
    * REVIEW: does the whole concept of spoofing (-s) and ranges make sense?
    * REVIEW: is it useful/helpful to print out IP ranges?

  * Nodes are sorted by key, not friendly name
    * node build\src\apps\graph.js data\azure\examples\00.demo\convert.yaml -t=vm0 -r 
    * Sort should probably be done in app and unit tests - not in graph.
    * Rationale: tests want to sort by key, but app wants to sort by display name (friendlyName ?? key)

  * . Better friendly name to node mapping
    * May have improved with [mhop/bugs1 860366f] FIX: better friendly name lookup in src/apps/graph.ts
  * x -q flag (for quiet) suppresses flag summary and node list

  * x `-t` should be the default for `-f -t`
  * x Option summary should mention that `-b` is default for `-t`.
  
  * x Identify unit test case for superset term coalescing.

  * node build\src\apps\graph.js data\azure\examples\00.demo\convert.yaml -t=jump-box -p
    * Internet needs `endpoint: true`
    * Need to coalesce terms with subset relation
    * Why does jumpbox subnet allow all traffic from vnet? This seems wrong. A fix here would be a work-around to the missing coalesce.
  * node build\src\apps\graph.js data\azure\examples\00.demo\convert.yaml -f=Internet -t=vm0
    * Shows no routes because vm0 maps to vm0/outbound
  * x Why does backproject of `from public-services-ip` give the following instead of `Internet`?
    * x except 10.0.0.0-10.0.87.255, 10.0.89.0-10.0.255.255
    * x node d:\git\labyrinth\build\src\apps\graph.js data\azure\examples\00.demo\convert.yaml -f=public-services-ip -t=vm2/inbound -b
    * x Answer: back-projecting code allows overwrites that can't happen
    * x Need to modify back-projecting code and forward-propagation in reverse mode (for multiple override terms)
  * Doesn't show `public-services-ip` because `-r` flag is missing. Why doesn't it show `Internet`?
    * node build\src\apps\graph.js data\azure\examples\00.demo\convert.yaml -t=vm0
    * convertResourceGraph() omits the `endpoint: true` property for Internet.
  * Investigate separate paths for `http` and `https` in
    * node build\src\apps\graph.js data\azure\examples\00.demo\convert.yaml -f=Internet -b
  * Improved literal-range to symbolic expression algorithm.
* Compare output of
  * node d:\git\labyrinth\build\src\apps\graph.js data\azure\examples\00.demo\convert.yaml -f=public-services-ip -t=vm2/inbound -b
  * node d:\git\labyrinth\build\src\apps\graph.js data\azure\examples\00.demo\convert.yaml -f=public-services-ip -t=vm0 -b

* Benefits
  * Users of relationships don't need to know the details of where relationships are stored in the specs and how they're encoded.
  * Prepare stage doesn't need to know the details of preparation for each spec type.
    * Don't need to know top-level types.
    * Spec-specific preparation code is next to materialize code.
  * createAzureNode and materialize() method on IAzureGraphNode
    * Pro: Materialization can happen in any order.
    * Con: Switch statement and need for different IAzureGraph node implementations

* Principles
  * Materializers don't know specifics of other node specs
  * Materializers don't know specifics of other node materializations

* Internal Load Balancer
  * Inbound NSG Rules don't appear to comply
  * Outbound NSG rules prevent vm from reaching nsg
  * Move Load balancer to backbone
    * Might simplfy that we can only look at the load balancer
    * Load balancer should route back to backbone
* How does the backbone handle vnets with overlapping subnets?
* x azure_types
  * x dead/commented out code in azure_types - asAzureNetworkInterface
* convert_nics.ts
  * convenience function to create nsgrules for possible null reference - use in createSubnet as well.
  * convenience function to encapsulate node construction with potentially undefined filters - use in createSubnet as well
  * Assuming all ipConfigs have same subnet. Otherwise
    * x destination_ip should join only those ips with matching subnet
    * x code that makes reference from subnet to nic should make reference if any ipconfig is for subnet
  * x createVmRoute may be too small for its own function
  * outbound routes will need to be modified for public ips
    * also, outbound routes with no longer be optional if there is at least one public ip
* convert_vm.ts
  * Routes should have constraint on source ips equal to union of nic ipconfigs
    * These routes will need to be passed down from parent.
  * Memoizing converter
    * Maps id to NodeSpec
    * Method to add to NodeSpec routes
    * xxx Factory to create convertVm()
    * xxx Factory to create instance of IConverters
* convert.ts
  * xxx Factory to create instance of IConverters.
  * xxx Decide whether unit tests need some sort of analogue.
* converters.ts
  * x Remove DESIGN ALTERNATIVE comment
* convert_nic.test.ts
  * x Can remove unused parameters to mock.
* sample_resource_graph.ts
  * x SEEMS wrong: export const vm1Id = nsgId(nsg1Name);
  * create idempotent key creator for use in unit tests
    * Integrate with sample_resource_graph.ts
* public ip
  * NAT
  * Incorporate into some sort of gateway outside the VNet, probably
* services.ids.createVarient(key, string)
* x delete deprecated folder
* Look for linter error for if on constant expression
* Node like a default gateway that routes outbound traffic to public ips, if necessary
* Consider unit test convenience function:
  * checkargs(nsglog[0],params)(nsg1, vnet1Id);
* Remove unused parameters to mocks
* 


* Top 2
  * range decoding: a-b becomes a,b when a and b are adjacent
  * AzurePOP node
    * Return traffic routing with TCP flags
  * Synthetic nodes
  * Azure backbone shouldn't route IPs into VNets. These routes should come from public IPs
  * VNet peerings
  * Resource graph sanitizer script - tokens, keys, etc.
  * Consider putting sample resource graph output in md files. Not sure this would add value.
  * Figure out case normalization for service tags
    * Azure uses TCP and tcp and Tcp
  * Move Azure-specific symbols to dedicated Azure universe.
  * Graph might want to print out the symbol table.
  * RoutingRuleSpec
    * Destination pools
    * Do we still want this feature?
  * Unit test for resourceGraph
    * Extract createGateway()/createBackbone()
  * Consider adding ranges back to nodes
  * Remove services.getInternetKey()
    * The resource graph is the sole owner of this key
    * The Internet service tag is another story
  * Consistant naming for converters (Ip vs IP, etc)
    * nic: convertNIC,
    * resourceGraph: convertResourceGraph,
    * subnet: convertSubnet,
    * vnet: convertVNet,
    * nsg: convertNSG,
    * ip: convertIp,
    * publicIp: convertPublicIp,
    * vm: convertVM,
  * Convenience function to initialize GraphServices.
  * Write design note
  * x Rename gateway to backbone
  * x Detecting cycles with NAT
  * x List Azure types not processed by conversion process
  * x convertIp() should become convertPrivateIp()
  * x Unit test for convertPublicIp()
  * x Unit tests for createPublicIp work in isolation, but fail after other tests have run.
  * x normalizeCase() should normalize type and id fields
  * x BUG: convertVNet() shouldn't route directly to the Internet.
  * x Add node keys to sample_resource_graph.ts
  * x Check for places to use createKeyVariant()
  * x VMs with multiple NICs
    * x Implement
    * x Unit test
  * x Deprecate Azure folder
  * x Rename Azure2 folder
  * x Intergrate with converter console application
    * x Smoke check with data/resource-graph-1.json
  * x Implement NAT for publicIp
  * x Rename LocalIp to PrivateIp
  * x Rename NodeKeyAndSourceIp to NodeKeyAndDestinationIp
  * x Remove NodeKeyAndDestinationIp
  * x Delete memoized conveter
  * x Rename types.ts to azure_types.ts
  * x Normalize casing in Azure Resource Graph type fields.
  * x Cherry pick PR #14
  * x In convertSubnet(): // TODO: import IRules from './types', not '../types'
  * . Implement convertNIC()
    * x Extract commonality with convertSubnet() to a function.
    * x Rework router/inbound/outbound to generate only inbound/outbound.
    * Unit test for omitted outbound node.
  * Rework convertIp()
    * x Take parent nodeKey
    * Separate handling for publicIp, privateIp
    * Correct handling of publicIp
  * . Decide whether to return routingRule or nodeKey + serviceTag pair.
    * Might need to improve parser to allow except anywhere
      * Or throw if field contains 'except'
    * This might change the semantics of except for some use cases (except a, b ==? except a, except b)
  * . Move away from Azure ids for node keys
    * x Use unique identifiers for node keys
      * x Need to think about brittleness in unit tests - where tests need to know how/order ids are allocate
    * x Put Azure id into node name field
    * Run shortener on Labyrinth graph, as necessary
    * x Idempotent node key generation
  * Decide whether to improve subnet unit test design for NSG
    * Issue is that NSG spec must be converted into inbound and outbound rules. These are hard-coded into the mock today. Assuming there will be other tests that will want to use the inbound and outbound rules. Perhaps nsg1 needs to be built from the concatenation of nsg1Inbound and nsg1Outbound.
  * x Naming consistency: convertNetworkSecurityGroup vs convertNIC, convertVNET
  * Review implementations and unit tests
    * convertIp
      * Rework to take parent node key
      * Split out into calls to convertLocalIP() and convertPublicIp()
    * convertNetworkSecurityGroup
      * Better mocking support
      * Unit test
    * convertNIC
      * Implement
      * Unit test
    * convertPublicIP
      * Implement
      * Unit test
    * convertResourceGraph
      * Unit test
    * convertSubnet
      * Figure out where IRules should live - probably an export of convert_network_security_group.ts.
    * convertVNet
      * Parent should pass in internet node key

* Top
  * Converters should return route to converted item.
  * convertIp() should take an optional filter parameter.
    * Use case is call from convertNic()
  * Should have separate converters for localIp and publicIp

* IPConfig references for scale set backend pools
* Mocks are confusing
* id shortening
  * x BUG: Need to shorten ids on both AnyAzureObjects and AzureIdReference
  * QUESTION: shorten before conversion or after or reintroduce aliases?
    * Renaming inside of expressions may be complex.
    * REVIEW: what if we need the old id and the new id in the node?
* BUG: isValidSymbol()
  * IF the convention is to use the Azure id as a service tag identifier, we need to either
    * Escape dash and comma
      * Converters will need to return two strings: nodeKey and serviceTag
    * Ensure that Azure never uses dash and comma.
    * Who is responsible for calling escapeSymbol()?
* BUG: convertResourceGraph() should not route from Internet to VNets.
* Nodes which may be visited more than once during the traversal
  * Ip Configurations for examples. Referenced both by subnet and Network Interface
  * Consider using memoizing converter.
    * Will need a converter object factory, especially for unit tests.
* Add Azure Service tags to Internet node in Resource Graph Converter
  * Routes should go to public ips instead of vnets.
* AzureUniverse
  * Use enum or constant for Universe `ip` dimension key.
    * serviceTagDimensionKey
  * Dedicated AzureUniverse file.
  * Consider AzureUniverse object?
  * Consider embedding the Universe in the GraphSpec.
    * This removes the necessity for a universe file and allows us to generate the AzureUniverse programmatically, which allows us to use a constant for the `ip` dimension key.

* GraphServices
  * Consider extracting index as public property. Pass index to constructor instead of passing resource graph.
  * x Consider extracting symbols as well.
* In vNetConverter - consider helper function for addressRange
* x Trip hazard:   services.defineSymbol('ip', spec.id, sourceIp);
  * x Consider defineServiceTag()
* Tests
  * Add a test to validate the internet path
    * Review how the node graph creates a route to the internet. Can this be representedby one node or does it need to be represented by two nodes in the graph one for outboundtraffic and one for the internet
  * Add a test for two VNEts with same subnets
    * Assume there are two vnets with the same CIDR where they are unique vnets and thusthe internet means different things to both of these vnets
* How do public ips impact the design?
  * Are they always top level?
  * If not, who keeps collection of routes to public ips?
  * Similar question for App gateways with DNS names. How does routing work?
  * Also Azure front door. DNS names instead of ips.
* Review error messages using double vs. single quotes
  * Does escaping happen when usign one or the other
* Can public IPs have NSG or only the things they are attached to?
* Should we template AzureIdReference?
* Remove Default Service Tag creation
  * Ex. ip converter


~~~
node_modules/prepress/build/src/apps/prepress.js documentation\src\azure_resource_graph.src.md documentation\azure_resource_graph.md
~~~

~~~
propagate(subnet2/inbound)
  flow:
    destination ip: 10.0.100.4-10.0.100.6
    destination port: 8080
    protocol: TCP
  flowNode.routes:
    destination ip: 10.0.100.4-10.0.100.6
    destination port: 8080
    protocol: TCP
  edge to nic2/inbound
    intersect:
      source ip: AzureLoadBalancer <=== term combines with Internet term
      destination ip: 10.0.100.4

      source ip: 10.0.88.0/24
      destination ip: 10.0.100.4
      destination port: ssh       <=== term drops during intersection because ssh != 8080, 8443

      source ip: Internet
      destination ip: 10.0.100.4
      destination port: 8080, 8443
      protocol: TCP
    with overrideFlow:
      destination ip: 10.0.100.4-10.0.100.6
      destination port: 8080
      protocol: TCP
    result routes:
      source ip: Internet
      destination ip: 10.0.100.4
      destination port: 8080
      protocol: TCP
~~~


