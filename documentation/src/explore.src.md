# Interactive Graph Exploration

The `labyrinth graph` command is great for finding out which traffic can flow where in a network. But what if you want to know why a certain traffic flow is allowed or disallowed? The `labyrinth explore` command lets you to interactively explore the graph, examining routing rules and observing their impact on traffic as you hop from node to node.

Let's do an example use the network graph in [data/azure/examples/00.demo/graph.yaml](../data/azure/examples/00.demo/graph.yaml).

![Resource Graph](src/00.demo.1.svg)

For this example, let's suppose we were contacted by a network engineer who was attempting to perform diagnostics from an `ssh` session on the `jump-box`. The engineer wanted to install a utility on `jump-box`, but found the machine couldn't reach the internet to initiate the download.

We can confirm this, using `labyrinth graph` to look at outbound traffic _from_ the `jump-box`. We will see that it can only reach itself and web servers `web0`, `web1`, and `web2`. 

[//]: # (script labyrinth graph data/azure/examples/00.demo/graph.yaml -q -f=jump-box)
~~~
~~~

There appears to be no route to the `Internet` node: 

[//]: # (script labyrinth graph data/azure/examples/00.demo/graph.yaml -q -f=jump-box -t=Internet)
~~~
~~~

We can even use the tool to run a virtual tracert from `vm1/outbound`, the outbound node of `jump-box`, to `web0`:

[//]: # (script labyrinth graph data/azure/examples/00.demo/graph.yaml -q -f=vm1/outbound -t=web0 -p -e)
~~~
~~~

While the tracert will give us a better understanding of the routing structures in the network, it won't really shed light on why there are no routes to `Internet`

## Labyrinth Explorer
It's time to switch to `labyrinth explore`. This command starts up an interactive session where we can enter commands to follow packets through the network. You can use the `help` command to display a list of available commands:

[//]: # (interactive one > node.exe -i build/src/apps/labyrinth.js explore data/azure/examples/00.demo/graph.yaml)
~~~
$ labyrinth explore data/azure/examples/00.demo/graph.yaml

> help
~~~

Since that `labyrinth explore` session examines the graph, it is helpful to know the node keys that correspond to higher level structures in the network. We can use the `nodes` command to display node keys, grouped by friendly name. Moving forward, we will use the node keys when referring to graph nodes:

[//]: # (interactive one > node.exe -i build/src/apps/labyrinth.js explore data/azure/examples/00.demo/graph.yaml)
~~~
> nodes
~~~

We can see, in the above list, that the `jump-box` corresponds to a pair of graph nodes. The `vm1/inbound` node handles traffic to the `jump-box`, while `vm1/outbound` handles outbound traffic.

The typical explorer workflow involves selecting a node in the graph where the exploration will start. Use the `from <node>` command to explore the graph, following outbound edges. If you want to walk backwards over inbound edges, use the `to <node>` command. In this examples, we'll start exploring outbound edges from `vm1/outbound`:

[//]: # (interactive one > node.exe -i build/src/apps/labyrinth.js explore data/azure/examples/00.demo/graph.yaml)
~~~
> from vm1/outbound
~~~

After you select a starting node, with either the `from` or `to` command, `labyrinth` displays the current path, the set of headers that can flow to this point on the path, and a list of edges, each of which can serve as the next step on the path.

In this example, the path has only a single node, which is `vm1/outbound`. The current set of headers is `(universe)`, which means that any IP packet can be introduced into the network from `vm1/outbound`. There is only one option for a next step, and this is to `nic1/outbound`. If you ever get lost during your exploration, you can use the `path` command to display this information again.

We can step ahead by typing in the number of the edge we'd like to take. In this case, the only available edge is number `0`:

[//]: # (interactive one > node.exe -i build/src/apps/labyrinth.js explore data/azure/examples/00.demo/graph.yaml)
~~~
> 0
~~~

This extends the path to `nic1/outbound`, while constraining the flow to packets with `sourceIP` equal to `10.0.88.4`. The only edge forward is to `subnet1/outbound`. Let's step there and then step again to `vnet1/outbound`:

[//]: # (interactive one > node.exe -i build/src/apps/labyrinth.js explore data/azure/examples/00.demo/graph.yaml)
~~~
> 0
> 0
~~~

Note that when we step out of `subnet1\outbound`, the packet flow is constrained further, to packets with `destinationIp` in the `vnet` and `destination port` targetting the `ssh` port. This constraint on the `destinationIp` is probably the reason that packets aren't getting to the `Internet`. Let's step forward to `vnet1/router` to see if this is the case:

[//]: # (interactive one > node.exe -i build/src/apps/labyrinth.js explore data/azure/examples/00.demo/graph.yaml)
~~~
> 0
~~~

At this point, we see that the only available step forward is to `vnet/inbound`. This is curious because it seems like the router should be able to get to the `Internet`. We can use the `edges` command to look at the actual edges in the graph, leaving `vnet1/router`:

[//]: # (interactive one > node.exe -i build/src/apps/labyrinth.js explore data/azure/examples/00.demo/graph.yaml)
~~~
> edges
~~~

We can see from the output that `vnet1/router` has two outbound edges. The reason we're only offered a next step to `vnet1/inbound` is that the `destinationIp` constraint of `52.183.88.218` on the edge to `loadBalancer1` eliminates all of the packets that were previously constrained to targetting `destinationIps` within `vnet1`.

Still, from the edges in the graph, it appears that the router cannot reach the internet under any circumstances. It can only route to `loadBalancer1` and `vnet1/inbound`. Perhaps there is another node on our path that can get to the `Internet`. Let's use the `back` command to step backwards to `vnet1/outbound` and then run the edges command again:

[//]: # (interactive one > node.exe -i build/src/apps/labyrinth.js explore data/azure/examples/00.demo/graph.yaml)
~~~
> back
> edges
~~~

We can see that `vnet1/outbound` has only one available step, even though it has edges to `vnet1/router`, `publicIp1/outbound`, and `AzureBackbone/outbound`. We suspect this last edge can get to the `Internet` and we can verify our hypothesis by using the `edges` command with a node parameter to inspect `AzureBackbone/outbound` and `Internet-Backbone`:

[//]: # (interactive one > node.exe -i build/src/apps/labyrinth.js explore data/azure/examples/00.demo/graph.yaml)
~~~
> edges AzureBackbone/outbound
> edges Internet-Backbone
~~~

We can see that `AzureBackbone/outbound` has routes to `Internet-Backbone` which has routes to `Internet`. So the question is, why did the current node, `vnet1/outbound`, disallow traffic to `AzureBackbone/outbound`? The reason is that the first edge, the one to `vnet1/router`, diverted all traffic with `destinationIp` targetting addresses in `vnet1`.

We saw that the `destinationIp` constraint was introduced when we stepped out of `subnet1/outbound`. Let's step back and take a look:

[//]: # (interactive one > node.exe -i build/src/apps/labyrinth.js explore data/azure/examples/00.demo/graph.yaml)
~~~
> back
> edges
~~~

We can see that the sole edge from `subnet1/outbound` constrained the `destinationIp` to `vnet1`. To see why, let's use the `spec` command to display the node specification for `subnet1/outbound`:

[//]: # (interactive one > node.exe -i build/src/apps/labyrinth.js explore data/azure/examples/00.demo/graph.yaml)
~~~
> spec
~~~

Here we see, under `routes`, that there is, in fact, a route to `vnet1/outbound`. The route doesn't have any constraints, but node also has a set of five `filters`. The first filter allows `ssh` traffic with `destinationIp` in `vnet1` and the second rule disallows all other traffic. It is the combination of these two rules the prevent traffic from reaching the `Internet`.
