# DESIGN ISSUES/CAPABILITIES

## TODO
* Get access to resource graph with localIp and publicIp.
* Current resource graph doesn't contain Microsoft.Network/publicIPAddresses.

## Rationale

Two flaws in original design:
* Testability
  * Individual conversion functions not exposed at top level because of nesting.
    * Make stand-alone functions
  * Conversion functions coupled to local variables in enclosing scope.
    * Take variables as parameters
    * Group parameters into GraphBuilder visitor object
      * Supplies index
      * Supplies local variables
    * GraphBuilder not easily unit-testable
      * Monkey patching
      * Mocking framework
      * One-off mock: IConverters
      * Want easy way to author default converter mocks.
* Name aliasing scheme depended on structure of AzureObject and its context in the resource graph.
  * Eliminate name aliasing scheme all-together.
  * Use name simplifier on second pass.

## Potential Plan
* Tree walker
* Name shortener
* Mark for symbols to suppress reverse lookup. Allows convention of converters returning node key which is also service tag.
* Rename old GraphBuilder. Perhaps NodeBuilder or NodeCollection?
* Mocking GraphBuilder. IConverters. builder.convert.subnet().
* For now converters return node key, which is also a symbol.
* Also: want to eliminate IO folder or consider mocking file system.



## Considerations

When converting Azure Resource Graphs to Labyrinth Graphs, an important design decision is whether we need to preprocess AzureObjects to extract data at a higher semantic level. There are a number of options for accomplishing the preprocessing. At one end of the spectrum is a dedicated pass that transforms the Azure Resource Graph into an intermediate tree of semantic nodes. A second pass would then convert the intermediate tree into Labyrinth nodes. At the other end of the spectrum is an approach that extracts selected bits of higher level data. These bits would be indexed in hash tables and inspected by a second pass that would generate Labyrinth nodes. Approaches along this spectrum could be implemented with multiple distinct passes, or with lazy evaluation and memoization.

Before deciding on an approach to preprocessing, we need to determine whether preprocessing is necessary. One driving factor is whether a node converter needs the results of another node's conversion. The following is a list of some scenarios where a converter might need information from another converter.
* Parent nodes building routes to child nodes need the child's Labyrinth node key for the destination.
  * Entry node names could be defined by convention and implemented by a stateless function that takes the Azure node id and perhaps type fields.
  * A child converter could return its inbound node key to the parent, if the parent were to invoke the child converter.
* Child nodes building routes to parent nodes need the parent's Labyrinth node key for the destination.
  * Entry node names could be defined by convention and implemented by a stateless function that takes the Azure node id and perhaps type fields.
  * If the parent converter invoked the child converter, it could pass its node key to the child converter.
* If graph conversion involves a set of tree traversals, we need some way of identifying all of the roots in the forest.
  * Today the set of roots in the set of Virtual Networks.
  * Will this change with support for multiple resource groups and subscriptions?
* If graph conversion involves a set of tree traversals, we will need some way to dereference Azure submodules.
  * This could be accomplished by an initial pass that indexes every Azure submodule in the resource graph. Converters could then use this index to dereference submodules.
  * An important question is whether submodule references constitute a graph or a tree. If a submodule can be referenced from multiple converters, we need to ensure the multiple dereferences don't trigger multiple conversions. One class of solution is to provide purely functional inspectors that answer questions about submodules. Another class of solution is to convert and memoize submodules on first dereference. Another class of solution is to convert all submodules to an intermediate form before running any converter.
* In certain cases, we need to aggregate values over a class of node types.
  * One example is aggregating vnet ranges or service tags to define the Internet service tag.
* Are there any cases where a converter needs the result of a more complicated graph query?
  * Hypothetical: Suppose an IP configuration needs information about its VNet and this is only accessible via its Subnet.

One approach might be to generate an intermediate tree of semantic nodes, that is then processed into Labyrinth nodes. Another approach might be to save certain bits of higher level data in hash tables. 

## Questions
* What does a converter need to know about other nodes?
  * Node key for entry point from the outside.
    * VNet converter needs construct route to inbound node of child subnet.
  * Node key for parent entry point from inside.
    * Subnet converter needs to construct outbound route to parent.
  * IP range.
    * Resource graph converter needs vnet ranges to define the Internet service tag.
    * Subnet needs IP addresses (or service tags) of child NICs
  * VNet of Subnet of IP address

## Code Review
* NodeSpec.range is not an IP address - it is a set of constraints used as the initial header set at the start of graph traversal, when spoofing is suppressed. If NodeSpec needs an IP range, we should be explicit about this.
* Some IPConfigurations don't have id fields.
  * Microsoft.Compute/virtualMachineScaleSets/ericmai

## Bespoke Traversal
* Defreferencing nodes incorporated by reference.
  * e.g. nic.properties.ipConfigurations
  * e.g. vnet.properties.subnets (is this truely incorporated by reference?)
  * These nodes need to be in some sort of index.
* Identify root nodes in traversal
* Strategy for nodes that aren't reachable from the root nodes
* Strategy for unsupported nodes
* Container nodes with inside/outside concepts
  * Need some means of wiring routes to the parent (outbound)
  * Need some means of wiring routes to the children
  * Parent needs some means of wiring routes to container (inbound).
  * Who is responsible for creating the children?
* Need to reason about certain collections of nodes
  * e.g. Internet service tag depends on the ranges associated with the VNets.
* Polymorphism
  * AzureIpConfiguration converter needs to work for
    * AzureLocalIP
    * AzurePublicIP
    * Note that AzureLocalIP and AzurePublicIP are just different `property` duck types of `Microsoft.Network/networkInterfaces/ipConfigurations`
      * Don't create union type AzureLocalIP | AzurePublicIp
    * Current class structure doesn't follow structure of resource graph.
  * Or we need a dispatch mechanism to apply the right converter.
* Modularity
  * Ability to unit test each converter in isolation
* Anti-patterns
  * No converter should modify another node's internal structure or rules
  * No converter should depend on another node's internal structure or rules
* Name shortener
  * For readability
  * For performance
* Consistent casing
  * `Microsoft.Network/virtualNetworks/subnets`
  * `microsoft.network/virtualnetworks`
  * AzurePublicIp, AzureLocalIP - Ip vs IP
* Need some way to access type literals for dispatching purposes.
* Dereferencing
  * Can an embedded AzureObject ever be a reference?
  * Can a reference ever be inlined?
* Quadratic node copies because converters return lists instead of side-effecting the node list.
* Subnets need a way of getting their vnets
* Finding VM scale set parts
* Idea: intermediate form

## Polymorphic Converters related by Abstract Base Class
Potential benefits
* Can apply converters "in parallel" to AzureObjects in the resource graph. This could be done with a map at the top level, or with a structural walk that hits interior nodes.

Potential downsides

## Notes

* [Obtaining Azure VM scale set private IP addresses through Azure REST API](https://stackoverflow.com/questions/50111834/obtaining-azure-vm-scale-set-private-ip-addresses-through-azure-rest-api)
* [Azure Rest API](https://docs.microsoft.com/en-us/rest/api/virtualnetwork/virtualnetworks/get#ipconfiguration)
* https://docs.microsoft.com/en-us/rest/api/compute/virtualmachinescalesets/get#virtualmachinescalesetipconfiguration
* Search `typescript tagged union access tag value`
* [Discrmiintated Unions](https://stackoverflow.com/questions/48750647/get-type-of-union-by-discriminant)
