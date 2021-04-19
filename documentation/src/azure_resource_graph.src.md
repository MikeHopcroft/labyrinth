# Azure Resource Graphs

`Labyrinth` was originally designed to analyze [Azure](https://azure.microsoft.com/en-us/) networks, answering questions like
* Which servers can receive traffic directly from the internet?
* Can traffic from the internet reach my database?
* Which services can my front-end web servers interact with?
* Can my back-end web service call out to services on the internet?
* Is the jump-box the only server that can SSH to the front-end web servers?

Currently `Labyrinth` models [OSI Layer 3](https://en.wikipedia.org/wiki/OSI_model#Layer_3:_Network_Layer) traffic in Azure networks. This means it can reason about IP packet headers fields, like the source and destination ip addresses and ports, and the protocol. The `Labyrinth` algorithm is fairly generic and capable of modeling concepts from other layers such as
* [Layer 4](https://en.wikipedia.org/wiki/OSI_model#Layer_4:_Transport_Layer) - e.g. TCP connection state and [stateful packet inspection](https://en.wikipedia.org/wiki/Stateful_firewall).
* [Layer 7](https://en.wikipedia.org/wiki/OSI_model#Layer_7:_Application_Layer) - e.g. [Application Gateways](https://docs.microsoft.com/en-us/azure/application-gateway/overview)

The analysis process starts with an
[Azure Resource Graph](https://docs.microsoft.com/en-us/azure/governance/resource-graph/overview#:~:text=Azure%20Resource%20Graph%20is%20a,can%20effectively%20govern%20your%20environment.), which you can obtain from your Azure tenant. `Labyrinth` will convert your resource graph to a generic graph representation and then then perform reachability analysis. The steps are
* Export an Azure Resource Graph from your tenant.
* Use Labyrinth's `convert.js` tool to transform the resource graph to a Labyrinth graph.
* Use Labytinth's `graph.js` tool to generate a reachability report.

## Sample Resource Graphs
Labyrinth includes 10 sample resource graphs, which can be found in the
[data/azure/examples](../data/azure/examples) folder. This tutorial uses the graph in [data/azure/examples/00.demo/resource-graph.json](../data/azure/examples/00.demo/resource-graph.json). This is a fairly simple network with three web servers behind a load balancer and a jump box, which is accessible via SSH for diagnostic purposes. Network security rules allow only HTTP and HTTPS traffic from the `public-services-ip` to the web servers. The jump-box is accessible via the `jump-box-ip`, using SSH, and it can access the web servers via SSH.

![Resource Graph](src/00.demo.1.svg)

## Exporting and Converting the Azure Resource Graph

If you'd prefer to analyze your own resource graph, you can use the following [az](https://docs.microsoft.com/en-us/cli/azure/) command to export a copy. Just replace the `"00000000-0000-0000-0000-000000000000"` with your subscription id.

~~~
% az graph query --output json -q 'Resources | where subscriptionId == "00000000-0000-0000-0000-000000000000" | where type !in ("microsoft.compute/virtualmachines/extensions", "microsoft.compute/disks", "microsoft.compute/sshpublickeys", "microsoft.storage/storageaccounts")' > resource-graph.json
~~~

Once you have your resource graph, use the `convert.js` application to transform it into a [Labyrinth graph file](../data/azure/examples/00.demo/convert.yaml). The first parameter is the path to the resource graph. The second parameter is the path to write the Labyrinth graph file.

[//]: # (spawn node build/src/apps/convert.js data/azure/examples/00.demo/resource-graph.json data/azure/examples/00.demo/convert.yaml)
~~~
~~~

You are now ready to perform reachability analysis.

## Tracing Flows _from_ a Node

Suppose we're interested in tracing all of the traffic that could flow _into_ the network from the `public-services-ip` node. We expect traffic to the green nodes in the following diagram:

![Resource Graph](src/00.demo.2.svg)

We can use the `graph.js` application with the `-f=public-services-ip` to show all flows _from_ `public-services-ip`. The first parameter is the `Labyrinth graph` file, obtained from the Azure resource graph. 

[//]: # (spawn node build\src\apps\graph.js data\azure\examples\00.demo\convert.yaml -f=public-services-ip)
~~~
~~~

The tool first displays a summary of the command-line options in effect and a list of endpoints in the graph. After this it shows the flows to the three web servers. We can see, above, that each of the three web servers is reachable from the `Internet`, with destination ports `8080` and `8443` and the `TCP` protocol.

## Back-Projecting Network Address Translation and Port Mapping

The tool correctly identified `vm0`, `vm1`, and `vm2` as the only nodes that can receive traffic from `public-services-ip`, but the traffic header details were confusing because they described the IP packet headers, as seen on arrival at the web servers. For example, `vm0` will only see packets addressed to `10.0.0.4` for ports `8080` and `8443`:

~~~
vm0 (vm2/inbound):
  flow:
    source ip: Internet
    destination ip: 10.0.100.4
    destination port: 8080, 8443
    protocol: TCP
~~~

While these are, in fact, the only packets from `public-services-ip` that `vm0` will ever see, what we really want to know is contents of the packet headers, as viewed from `public-services-ip`. From outside of the `virtual-network` we can't even see `10.0.0.4` because it is an internal IP address. All we can see are the two public IPs, `52.183.88.216` and `52.156.96.94`.

In this example network, the `load-balancer` performs
[network address translation](https://en.wikipedia.org/wiki/Network_address_translation) from the public ip address `52.183.88.216` to one of the three web server ip addresses. It also performs port mapping, translating the `http` and `https` ports to `8080` and `8443`, respectively.

Labyrinth can provide a more useful analysis by `back-projecting` header flows to their starting values. In the following diagram, the headers have been labeled with their values on entry to the network at `public-services-ip`:


![Resource Graph](src/00.demo.3.svg)

We enable back-projection with the `-b` flag. In the following example, we also use the `-q` flag to suppress the options summary and node list.

[//]: # (spawn node build\src\apps\graph.js data\azure\examples\00.demo\convert.yaml -f=public-services-ip -b -q)
~~~
~~~

The output now shows the updated header flows to `vm0`, `vm1`, and `vm2`, _as seen from `public-services-ip`. For example, the packets with the following headers can flow from `public-services-ip` to `vm0`:

~~~
vm0 (vm2/inbound):
  flow:
    source ip: Internet
    destination ip: 52.183.88.218
    destination port: http, https
    protocol: TCP
~~~

## Finding Flows _to_ a Node

`Labyrinth` can also find all of the packets that can reach a specified node. Suppose we want to find all of the traffic _to_ the `jump-box`:

![Resource Graph](src/00.demo.4.svg)

We can use the `-t` flag find flows _to_ a specified node. 
Note that we don't have to use the `-b` flag with the `-t` flag, because the reverse flow analysis from the `jump-box` endpoint will produce header flows as seen from the various starting points.

[//]: # (spawn node build\src\apps\graph.js data\azure\examples\00.demo\convert.yaml -t=jump-box -q)
~~~
~~~

We can see from the output that traffic from the `Internet`, `vm0`, `vm1`, `vm2`, and the `jump-box` itself can reach the `jump-box`. 

## Virtual Traceroute
Sometimes we'd like to know the actual path the IP packets traverse on the way to their destination. We can use the `-p` flag to display paths. In the following example, we trace the route from `vm0` to the `jump-box`:

[//]: # (spawn node build\src\apps\graph.js data\azure\examples\00.demo\convert.yaml -f=vm0 -t=vm1/inbound -p -q)
~~~
~~~

The path is
* **vm0** - trace route starts at this server
* **vm0148** - NIC applies outbound NSG rules
* **public-services-subnet** - subnet applies outbound NSG rules
* **virtual-network** - routes traffic to jump-box-subnet
* **jump-box-subnet** - subnet applies inbount NSG rules
* **jump-box948** - NIC applies inbound NSG rules
* **jump-box** - trace route ends here


## Other Flags

The `graph.js` tool provides a number of other features, which can be enabled by command-line flags. You can use the `-h` flag to display a brief summary of the available flags:

[//]: # (spawn node build\src\apps\graph.js data\azure\examples\00.demo\convert.yaml -h)
~~~
~~~


Spoofing?

