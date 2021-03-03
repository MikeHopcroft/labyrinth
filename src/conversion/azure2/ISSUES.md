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
* 
