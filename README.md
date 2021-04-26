# Labyrinth NSG

![Node.js CI](https://github.com/MikeHopcroft/labyrinth/workflows/Node.js%20CI/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/MikeHopcroft/labyrinth/badge.svg?branch=main)](https://coveralls.io/github/MikeHopcroft/labyrinth?branch=main)

`Labyrinth` is an experimental tool for performing packet flow analysis in computer networks. Given a description of a network configuration, `Labyrinth` can answer questions like:
* Which servers can receive traffic directly from the internet?
* Can traffic from the internet reach my database?
* Which services can my front-end web servers interact with?
* Can my back-end web service call out to services on the internet?
* Is the jump-box the only server that can SSH to the front-end web servers?

The `Labyrinth` graph algorithms are network agnostic and capable of analyzing a wide variety of networking concepts and appliances. `Labyrinth` makes use of `converters` to transform vendor-specific network configuration descriptions into `Labyrinth` graphs, suitable for analysis.

Currenly, `Labyrinth` includes a converter for [Azure Resource Graphs](https://docs.microsoft.com/en-us/azure/governance/resource-graph/overview#:~:text=Azure%20Resource%20Graph%20is%20a,can%20effectively%20govern%20your%20environment.).
This converter models [OSI Layer 3](https://en.wikipedia.org/wiki/OSI_model#Layer_3:_Network_Layer) traffic. This means it can reason about IP packet headers fields, like the source and destination IP addresses and ports, and the protocol. The `Labyrinth` algorithm is fairly generic and capable of modeling concepts from other layers such as
* [Layer 4](https://en.wikipedia.org/wiki/OSI_model#Layer_4:_Transport_Layer) - e.g. TCP connection state and [stateful packet inspection](https://en.wikipedia.org/wiki/Stateful_firewall).
* [Layer 7](https://en.wikipedia.org/wiki/OSI_model#Layer_7:_Application_Layer) - e.g. [Application Gateways](https://docs.microsoft.com/en-us/azure/application-gateway/overview)

## Try Labyrinth
`Labyrinth` is currently in the earliest stages of development, so documentation is sparse, and the API is evolving. If you are interested in taking a look, we recommend starting with the
[Labyrinth Tutorial](documentation/tutorial.md).

## How Labyrinth Works
If you are interested in learning more about how `Labyrinth` works, please read the
[labyrinth architectural concepts](documentation/architectural_concepts.md).

