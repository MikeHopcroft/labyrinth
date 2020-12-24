# Policy Explanation

`labyrinth` can reason about policies [from many domains](./defining_universes.md).
For this example, let's consider firewall policies 
like the one in [data/policy.txt](../data/policy.txt):

[//]: # (file data/policy.txt)
~~~
# The first line defines the fields in the remaining lines
action protocol sourceIp destinationIp destinationPort

# Subsequent lines define individual rules

# Isolating private addresses
deny ip 10.0.0.0/8 any

# permits for IPs without port and protocol blocks
allow ip any 171.64.64.0/20

# standard port and protocol blocks
deny tcp any any 445
deny udp any any 445

# permits for IPs with port and protocol blocks
allow ip any 128.30.0.0/15

~~~

In this file, the policy is expressed as a sequence of rules that `allow` and `deny` certain routes. Each rule consists of a space-separated list of field values. The order of the fields is specified in the second line.

* The first rule denies any traffic _from_ ip addresss in the [CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing) block `10.0.0.0/8`.

* The second rule allows any traffic _to_ addresses in `171.64.64.0/20`.

* The third and fourth rules restrict _all_ traffic involve the `tcp` and `udp` protocols to port `445`.

* The final rule allows traffic to `128.30.0.0/15`.

Note that field values can take a wide variety of forms including
* Single numeric and ip address values like `445` and `171.64.64.1`.
* CIDR blocks like `128.30.0.0/15`.
* Ranges like `1.1.1.1-1.1.1.5` or `80-81`
* Symbols that map to single values like `localhost` or `tcp`.
* Symbols that map to ranges like `internet` or `loopback`.
* Unions of the above, like `tcp, udp` or `10.10.10.0/8, localhost`.
* The `except` keyword can be used to specify the complement of an expression.

You can read more about field values in [Firewall Specification]((../src/spec/../../../../build/src/specs/firewall.js)) and [Defining Universes](./defining_universes.md)

## Policy Conventions

In order to reason about a policy, `labyrinth` must know whether to interpret it with the `First-Applicable` convention or the `Deny-Overrides` convention. We can use the `--mode` or `-m` flag to specify
the convention. If no convention is specified, `labyrinth` defaults to `Deny-Overrides`.

# Deny-Overrides Convention

In the `Deny-Overrides` convention, routes are checked against each rule in turn. Since all rules are examined, any `deny` rule that appears after an `allow` rule will further restrict the set of allowable routes. 

Let's examine `data/policy.txt` with the `Deny-Overrides` convention.
This is the default convention, but we can specify it explicitly with
`-m=d` or `-m=denyOverrides`:

[//]: # (spawn node build\src\apps\analyze.js data\policy.txt -m=d)
~~~
$ node build\src\apps\analyze.js data\policy.txt -m=d

~~~

The output is a set expression in [disjunctive normal form](https://en.wikipedia.org/wiki/Disjunctive_normal_form). The conjunctions are separated by blank lines and consist of a sequence of restrictions on various dimensions.

In this example, the allowable routes are summarized by three conjunctions. Any route that matches any of the three conjunctions is allowed. All other routes are denied.

From the above policy report, we can see that
* The first conjunction allows traffic to `171.64.64.0/20` as long as its protocal is not `tcp` or `udp`.

* The second conjunction allows all traffic to `128.30.0.0/15`, regardless of protocol, port, or source.

* The third conjunction allows all traffic to `171.64.64.0/20` as long as it is not on port `445`. Note that the third conjunction overlaps the first conjunction.

## First-Applicable Convention

In the `First-Applicable` convention, routes are checked against each rule in turn, until a rule applies to the route. At this point the route is immediately allowed or denied.

We can examine the same `data/policy.txt` file with the `First-Applicable` convention, by specifying `-m=f` or `-m=firstApplicable`:

[//]: # (spawn node build\src\apps\analyze.js data\policy.txt -m=f)
~~~
$ node build\src\apps\analyze.js data\policy.txt -m=f

~~~

Notice how the allowed routes differ from those in the previous example:
* The first conjunction allows routes from `171.64.64.0/20` as long as they don't go to `171.64.64.0/20`.
* The second permits routes to `128.30.0.0/15` as long as they don't come from `10.0.0.0/8` with protocols `tcp` or `udp`. Note that routes from `10.0.0.0/8` are allowed if they use other protocals, and routes with `tcp` or `upd` are allowed as long as they don't originate in `10.0.0.0/8`.
* The third also permits routes to `128.30.0.0/15`, but if they come from `10.0.0.0/8` they cannot be to port `445`.

## Rule attribution

It is often helpful to know which rules let to a certain conjunction in the `Policy Report`. We can use the `-a` or `--attribution` flag to turn on rule attribution:

[//]: # (spawn node build\src\apps\analyze.js data\policy.txt -a)
~~~
$ node build\src\apps\analyze.js data\policy.txt -a

~~~

This report now lists the sets of rules that led to each conjunction. At this time, the rules are referenced by line numbers in the input file, so for example, the first conjunction is informed by the following rules:
* **Line 10:** allow ip any 171.64.64.0/20
* **Line 13:** deny tcp any any 445
* **Line 14:** deny udp any any 445

The second conjunction is only informed by a single rule:
* **Line 17:** allow ip any 128.30.0.0/15

## YAML Policy Files

The preceding examples were based on a text format commonly used specifying for firewall rules. `labyrinth` can also accept policies from [YAML](https://en.wikipedia.org/wiki/YAML) files.

The file `data/policy.yaml` encodes the same policy as `data/policy.txt`:

[//]: # (file data/policy.yaml)
~~~yaml
rules:
  - action: deny
    priority: 1
    sourceIp: 10.0.0.0/8
  - action: allow
    priority: 2
    destinationIp: 171.64.64.0/20
  - action: deny
    priority: 3
    destinationPort: 445
    protocol: tcp, udp
  - action: allow
    priority: 4
    destinationIp: 128.30.0.0/15

~~~

Note the use of `priority` fields that specify  the order in which the rules are processed.

---
### [Next: Contract Validation](./contract_validation.md)
