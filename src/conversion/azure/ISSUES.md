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
* delete deprecated folder
* Look for linter error for if on constant expression
* Node like a default gateway that routes outbound traffic to public ips, if necessary
* Consider unit test convenience function:
  * checkargs(nsglog[0],params)(nsg1, vnet1Id);
* Remove unused parameters to mocks
* 


* Top 2
  * Add node keys to sample_resource_graph.ts
  * Check for places to use createKeyVariant()
  * Consistant naming for converters (Ip vs IP, etc)
    * nic: convertNIC,
    * resourceGraph: convertResourceGraph,
    * subnet: convertSubnet,
    * vnet: convertVNet,
    * nsg: convertNSG,
    * ip: convertIp,
    * publicIp: convertPublicIp,
    * vm: convertVM,
  * x VMs with multiple NICs
    * x Implement
    * x Unit test
  * x Deprecate Azure folder
  * x Rename Azure2 folder
  * x Intergrate with converter console application
    * x Smoke check with data/resource-graph-1.json
  * x Implement NAT for publicIp
  * Add ranges back to nodes
  * Write design note
  * Remove services.getInternetKey()
    * The resource graph is the sole owner of this key
    * The Internet service tag is another story
  * Convenience function to initialize GraphServices.
  * Move Azure-specific symbols to dedicated Azure universe.
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
