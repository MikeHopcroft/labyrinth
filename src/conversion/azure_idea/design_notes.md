# DESIGN ISSUES/CAPABILITIES

## TODO
* Get access to resource graph with localIp and publicIp.
* Current resource graph doesn't contain Microsoft.Network/publicIPAddresses.

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

* Search `typescript tagged union access tag value`
* [Discrmiintated Unions](https://stackoverflow.com/questions/48750647/get-type-of-union-by-discriminant)
