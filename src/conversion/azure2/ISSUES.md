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

* Top 2
  * Cherry pick PR #14
  * x In convertSubnet(): // TODO: import IRules from './types', not '../types'
  * . Implement convertNIC()
    * . Extract commonality with convertSubnet() to a function.
    * Rework router/inbound/outbound to generate only inbound/outbound.
  * Rework convertIp()
    * Take parent nodeKey
  * . Decide whether to return routingRule or nodeKey + serviceTag pair.
    * Might need to improve parser to allow except anywhere
    * This might change the semantics of except for some use cases (except a, b ==? except a, except b)
  * Rename NodeKeyAndSourceIp to NodeKeyAndDestinationIp
  * Move away from Azure ids for node keys
    * Use unique identifiers for node keys
      * Need to think about brittleness in unit tests - where tests need to know how/order ids are allocate
    * Put Azure id into node name field
    * Run shortener on Labyrinth graph, as necessary
  * Decide whether to improve subnet unit test design for NSG
    * Issue is that NSG spec must be converted into inbound and outbound rules. These are hard-coded into the mock today. Assuming there will be other tests that will want to use the inbound and outbound rules. Perhaps nsg1 needs to be built from the concatendation of nsg1Inbound and nsg1Outbound.
  * Naming consistency: convertNetworkSecurityGroup vs convertNIC, convertVNET
  * Remove services.getInternetKey()
    * The resource graph is the sole owner of this key
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
