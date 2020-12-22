import {Universe} from '../dimensions';
import {Disjunction} from '../setops';

import {Edge} from './edge';
import {ForwardRule, parseForwardRuleSpec} from './forward_rule';
import {Graph} from './graph';
import {ForwardRuleSpecEx, NodeSpec} from './types';

export class Node {
  name: string;
  key: string;

  rules: ForwardRule[];

  forwarded = false;
  inDegree = 0;
  in: Array<Edge> = [];
  out: Array<Edge> = [];

  routes = Disjunction.create<ForwardRuleSpecEx>([]);

  constructor(universe: Universe, spec: NodeSpec) {
    this.name = spec.name;
    this.key = spec.key;
    this.rules = spec.rules.map(r => parseForwardRuleSpec(universe, r));

    // TODO: spec should be able to specify entry points
    if (this.name === 'internet') {
      this.routes = Disjunction.universe<ForwardRuleSpecEx>();
    }
  }

  mark() {
    this.inDegree++;
  }

  addIncoming(edge: Edge): boolean {
    if (this.forwarded) {
      const message = 'Graph contains a cycle.';
      throw new TypeError(message);
    }
    this.in.push(edge);
    return this.inDegree === this.in.length;
  }

  forwardMarks(graph: Graph) {
    const destinations = new Set<string>(this.rules.map((r) => r.destination));
    for (const key of destinations) {
      graph.node(key).mark();
    }
  }

  forwardRoutes(graph: Graph) {
    if (this.forwarded) {
      const message = 'Internal error';
      throw new TypeError(message);
    }
    this.forwarded = true;

    // Union up incoming routes.
    for (const edge of this.in) {
      // TODO: consider simplification here.
      this.routes = this.routes.union(edge.routes);
    }

    // Construct outgoing routes
    const keyToRoute = new Map<string, Disjunction<ForwardRuleSpecEx>>();
    // let remaining = Disjunction.universe<ForwardRuleSpecEx>();
    let remaining = this.routes;
    for (const rule of this.rules) {
      const allowed = Disjunction.create([rule.conjunction]);
      const current = allowed.intersect(remaining);
      remaining = remaining.subtract(allowed, graph.simplifier);

      let routes = keyToRoute.get(rule.destination);
      if (routes) {
        routes = routes.union(current);
      } else {
        routes = current;
      }
      keyToRoute.set(rule.destination, current);
    }

    // Add an edge for each outgoing route.
    for (const [to, routes] of keyToRoute.entries()) {
      graph.addEdge({from: this.key, to, routes});
    }
  }
}
