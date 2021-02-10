# Azure Resource Graphs

Labyrinth provides a sample application that converts an [Azure Resource Graph](https://docs.microsoft.com/en-us/azure/governance/resource-graph/overview#:~:text=Azure%20Resource%20Graph%20is%20a,can%20effectively%20govern%20your%20environment.) into a Labyrinth graph, suitable for flow analysis.

## Exporting the Azure Resource Graph

You can use the `az` command to export the `Azure Resource Graph`. In the example, below, replace `"labyrinth-sample"` with the name of your resource group.

~~~
% az graph query -q 'resources | where resourceGroup == "labyrinth-sample" | where type in~ ("Microsoft.Network/n
etworkInterfaces", "Microsoft.Network/networkSecurityGroups", "Microsoft.Network/virtualNetworks")' > resources.json
~~~

## Sample Azure Resource Graph

Labyrinth includes a sample Azure Resource Graph in [resource-graph-1.json](data/azure/resource-graph 1.json). This was exported from an actual Azure deployment. It has the following structure:

![resource-graph-1](src/resource-graph-1.png)

## Converting the Azure Resource Graph

Use the `convert.js` application to generate a Labyrinth graph file:

[//]: # (spawn node build/src/apps/convert.js data/azure/resource-graph-1.json data/azure/resource-graph-1.yaml)
~~~
$ node build/src/apps/convert.js data/azure/resource-graph-1.json data/azure/resource-graph-1.yaml
Azure resource graph input file: data/azure/resource-graph-1.json
Labyrinth graph output file: data/azure/resource-graph-1.yaml
data.nic.b367ee68-39d3-47ca-8592-c233fb2fee4a: microsoft.network/networkinterfaces
blob-blob.privateEndpoint: Microsoft.Network/networkInterfaces/ipConfigurations
frontend: microsoft.network/networkinterfaces
default: Microsoft.Network/networkInterfaces/ipConfigurations
jumpbox: microsoft.network/networkinterfaces
default: Microsoft.Network/networkInterfaces/ipConfigurations
backendNSG: microsoft.network/networksecuritygroups
frontendNSG: microsoft.network/networksecuritygroups
jumpboxNSG: microsoft.network/networksecuritygroups
vnet: microsoft.network/virtualnetworks
  VNet: vnet
    address prefixes: [10.0.0.0/23]
    Subnet: jumpboxSubnet
      addressPrefix: 10.0.0.0/25
      ipConfigurations:
        jumpbox/default (10.0.0.4)
      Network Security Group: jumpboxNSG
        Default rules
          AllowVnetInBound (65000)
          AllowAzureLoadBalancerInBound (65001)
          DenyAllInBound (65500)
          AllowVnetOutBound (65000)
          AllowInternetOutBound (65001)
          DenyAllOutBound (65500)
        Rules
          allow_ssh (1000)
          allow_https (1100)
    Subnet: frontendSubnet
      addressPrefix: 10.0.0.128/25
      ipConfigurations:
        frontend/default (10.0.0.132)
      Network Security Group: frontendNSG
        Default rules
          AllowVnetInBound (65000)
          AllowAzureLoadBalancerInBound (65001)
          DenyAllInBound (65500)
          AllowVnetOutBound (65000)
          AllowInternetOutBound (65001)
          DenyAllOutBound (65500)
        Rules
          allow_http (1000)
          allow_https (1100)
    Subnet: backendSubnet
      addressPrefix: 10.0.1.0/24
      ipConfigurations:
        data.nic.b367ee68-39d3-47ca-8592-c233fb2fee4a/blob-blob.privateEndpoint (10.0.1.4)
      Network Security Group: backendNSG
        Default rules
          AllowVnetInBound (65000)
          AllowAzureLoadBalancerInBound (65001)
          DenyAllInBound (65500)
          AllowVnetOutBound (65000)
          AllowInternetOutBound (65001)
          DenyAllOutBound (65500)
        Rules
          allow_jumpbox (1000)
          allow_frontend (1100)
          block_outbound (1000)
jumpboxSubnet: Microsoft.Network/virtualNetworks/subnets
frontendSubnet: Microsoft.Network/virtualNetworks/subnets
backendSubnet: Microsoft.Network/virtualNetworks/subnets
done
Conversion complete.

~~~

This will write the Labyrinth graph to [resource-graph-1.yaml](./data/azure/resource-graph 1.yaml):

[//]: # (file data/azure/resource-graph-1.yaml)
~~~
~~~


## Analyzing the Graph

Use the `graph.js` application to analyze packet flows in the graph.

[//]: # (spawn node build/src/apps/graph.js data/azure/resource-graph-1.yaml -f=Internet)
~~~
$ node build/src/apps/graph.js data/azure/resource-graph-1.yaml -f=Internet
Options summary:
  Not modeling source ip address spoofing (use -s flag to enable).
  Displaying endpoints only (use -r flag to display routing nodes). 
  Not displaying paths (use -s or -v flags to enable).
  Brief mode (use -v flag to enable verbose mode).

Endpoints:
  jumpbox/default: 10.0.0.4
  frontend/default: 10.0.0.132
  data.nic.b367ee68-39d3-47ca-8592-c233fb2fee4a/blob-blob.privateEndpoint: 10.0.1.4
  Internet: Internet

Nodes reachable from Internet:

jumpbox/default:
  routes:
    source ip: AzureLoadBalancer
    destination ip: 10.0.0.4

    source ip: Internet
    destination ip: 10.0.0.4
    destination port: ssh, https
    protocol: Tcp

frontend/default:
  routes:
    source ip: AzureLoadBalancer
    destination ip: 10.0.0.132

    source ip: Internet
    destination ip: 10.0.0.132
    destination port: http, https
    protocol: Tcp

data.nic.b367ee68-39d3-47ca-8592-c233fb2fee4a/blob-blob.privateEndpoint:
  routes:
    source ip: AzureLoadBalancer
    destination ip: 10.0.1.4


~~~

