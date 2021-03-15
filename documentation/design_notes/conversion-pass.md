# Design Note on Azure Conversion 

This note covers decisions that were made in the design of the azure converter.

## Fundamentals
* The conversion will be separated into two passes `prepration` and `materialization`
* No `Azure Graph Node` should take a direct dependecy on any other node during the `prepration` pass
  * The exception to this rule is for `synthetic id`
* The key objective of the `prepration` pass is to normalize data, index items and advertise `relationships`
* The key objective of the `materialization` pass is produce `labyrinth nodes` and `labyrinth service tags`

### Node Types
There are three node types that are used in the Azure Resource Graph conversion process
- Spec - This node is defined by Azure and represents the data within the Azure Resource Graph
- Labyrinth Node - This is the outcome of the `materialization` pass of the conversion process
- Azure Graph Node - This node is created during the `preparation` pass of the conversion process. The node is constructed 
  by observing the `spec` and delclaring the required relationships that must exist during `materialization`

### Relationships
Nodes should only depend on other nodes though a `relationship` declaration. The relationship may be declared by either 
side as not every `spec` knows about every depdendency. A good example of this is that in order to `materialize` a `subnet`
the node needs to know which `network interface` objects are attached to it. The `subnet` spec however does not have this data.
Instead the `azure graph node` implementation of a `subnet` declares that it has a `relationship` with the `network interface` and when a `network interface` is observed it will advertise the `relationship` between itself and the `subnet`

Example
~~~
nics: () => {
    return services.getRelated(spec, AzureObjectType.NIC);
},
~~~

### Indexing of Specs
The first version of this conversion process attempted to avoid exposing an index of the `spec` or `azure graph node` and to attempt to achieve dependencies through `relationship` declartions. This worked well for everything except for the `sythetic id`. The next choice was whether to expose the spect on every `azure graph node` or to expose a lookup mechanism to find the `spec`. The latter was chosen as it felt like less of code smell after exploring both implementations.

As of writing this, the spec index is still exposed during the `prepration` pass, however it might be worth exploring if this could be removed in favor of a synthetic spec which is produced for the `synethic` phase of the `prepration` pass.
  
## Key Challenges
### Type Inconsistencies
The type for Azure Objects in the graph is recorded in consistently. 

Example
~~~
microsoft.compute/virtualmachinescalesets
Microsoft.Compute/virtualMachineScaleSets
~~~

#### **Solution**
This can be dealt with through normalization or case-insenstive comparisons. The lattter while preferred makes the type guarding process within typescript a little more cumbersome.

---

### Sythentic Ids and Elements
There are reference ids in the graph which do not exist. So far the only two types which have been observed are `network interface` and `ip configuration` for `virtual machine scale set`. 

#### **Example**
Below is an example of `synthetic id` and a pruned down example of a `virtual machine scale set` in which the object may be derived. This reference was obtained from a `backend pool` of a `load balancer`, which is referencing an `ip` of a `network interface` attached to a `virtual machine` that is within a `virtual machine scale set`.
~~~
// Reference Id
/subscriptions/00000000-0000-0000-0000-0000000000/resourceGroups/vnet-testing/providers/Microsoft.Compute/virtualMachineScaleSets/ericmai/virtualMachines/0/networkInterfaces/vnet-loadbalancer-vnet-nic01/ipConfigurations/vnet-loadbalancer-vnet-nic01-defaultIpConfiguration

// Simplified Azure Virtual Machine Scale Set
{
    "extendedLocation": null,
    "id": "/subscriptions/00000000-0000-0000-0000-0000000000/resourceGroups/vnet-testing/providers/Microsoft.Compute/virtualMachineScaleSets/ericmai",
    "properties": {
      "virtualMachineProfile": {
        "networkProfile": {
          "networkInterfaceConfigurations": [
            {
              "name": "vnet-loadbalancer-vnet-nic01",
              "properties": {
                "ipConfigurations": [
                  {
                    "name": "vnet-loadbalancer-vnet-nic01-defaultIpConfiguration",
                    "properties": {
                      "primary": true,
                      "privateIPAddressVersion": "IPv4",
                      "subnet": {
                        "id": "/subscriptions/00000000-0000-0000-0000-0000000000/resourceGroups/vnet-testing/providers/Microsoft.Network/virtualNetworks/vnet-loadbalancer-vnet/subnets/default",
                        "resourceGroup": "vnet-loadbalancer"
                      }
                    }
                  }
                ],
                "networkSecurityGroup": {
                  "id": "/subscriptions/00000000-0000-0000-0000-0000000000/resourceGroups/vnet-testing/providers/Microsoft.Network/networkSecurityGroups/basicNsgvnet-loadbalancer-vnet-nic01",
                  "resourceGroup": "vnet-loadbalancer"
                },
                "primary": true
              }
            }
          ]
        }
      }
    }
}
~~~

#### **Solution**
The `synthetic id` is dealt with by adding a second phase to the `preparation` pass. The first phase observes and indexes all fully qualified types in the graph. The second phase, partially breaks the initial design fundamentals which in the case of the `ip configuration` id above would require that it looks up the `virtual machine scale set` to complete it's only prepration.

The id can be parsed into the following parts. Given these parts it's possible to lookup the `virtual machine scale set` then walk it's properties to pull out relevant information for the `ip configuration`

~~~
{
    VmssId : "/subscriptions/00000000-0000-0000-0000-0000000000/resourceGroups/vnet-testing/providers/Microsoft.Compute/virtualMachineScaleSets/ericmai",
    NetworkInterface : "vnet-loadbalancer-vnet-nic01"
    IpConfiguration : "vnet-loadbalancer-vnet-nic01-defaultIpConfiguration"
}
~~~

----

### Missing Data - Unresolved
Objects in the graph which are only represented synthetically do not have all information available. A key piece of information that does not exist in the graph is the current configuration of the `ip addresss` for a synthetic `ip configuration`. 

#### **Possible Solutions**
* Introduce IP Allocator - this would track ip's for those known in the system and would allow allocation of a synthetic ip during the `materialization` pass of the conversion
* Azure Rest Calls - Add a service which further inspects Azure beyond the resource graph in order to obtain the data at time of conversion
* Require Supplemental Data - Require an additional payload of information is supplied which enables look up for sythetic items
