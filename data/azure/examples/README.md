# Azure Sample Graphs

Write something useful here soon.

### Testing New Graph
- Create a folder under examples
- Use the following command to generate a graph. Scope it to the appropriate resource group or groups
  ```
  az graph query --output json -q 'Resources | where resourceGroup in ("x-vnet-example") | where type !in ("microsoft.compute/virtualmachines/extensions", "microsoft.compute/disks", "microsoft.compute/sshpublickeys", "microsoft.storage/storageaccounts")' 
  ```
- Save the output as a file called `resource-graph.json` within the new folder
- Execute `run.cmd` from within the Examples directory

## Sample Graphs
The sample graphs listed here have been evolved from the same base and their evolution is ordered with the ordinal prefix. Each one builds on top of the other with a minimal delta of changes.

### 01.graph-basic-vnet
This graph contains a simple virtual network, with a single subnet and a single virtual machine. The virutal machine is bound to a public ip.

### 02.graph-multi-subnet
This graph adds a second subnet and second VM with a public ip.

### 03.graph-internal-load-balancer
This graph add an internal load balancer with rules to one of the VMs

### 04.graph-load-balancers
This graph adds a public load balancer with rules to one of the VMs

### 05.graph-VMSS
This graph adds a Virtual Machine Scale Set and adds a rule while balances to the pool of machiens

### 06.graph-internet-routing
This graph removes an existing public ip, which preferes the Microsoft network for routing, and replaces it with a new public ip which prefers to use the internet

### 07.graph-multiple-vnet
This graph adds a second virtual network and a machine inside of this virtual network
  
### 08.graph-overlapping-vnet
This graph updates the second virtual network to create overlapping networks

### 09.graph-load-balancer-outbound-rules
This graph updates the public load balancer to configure it to use outbound routes

  NOTE: As of documenting. Outbound rules are not yet supported in the graph.
