# Detecting Redundant Rules

`labyrinth` can also detect redundant rules in a policy. Consider, for example, the rules in `data/redundant.txt`:

[//]: # (file data/redundant.txt)
~~~
# The first line defines the fields in the remaining lines
action protocol sourceIp destinationIp destinationPort

# Subsequent lines define individual rules

# Isolating private addresses
deny ip 10.0.0.0/8 any

# permits for IPs without port and protocol blocks
allow ip any 171.64.64.0/20
allow ip any 171.64.64.0/21

# standard port and protocol blocks
deny tcp any any 445
deny udp any any 445

deny tcp any 171.64.64.1 445

# permits for IPs with port and protocol blocks
allow ip any 128.30.0.0/15

~~~

This file was made by adding two redundant rules to `data/policy.txt`:
* **Line 11:** allow ip any 171.64.64.0/21
* **Line 17:** deny tcp any 171.64.64.1 445

We can use the `-r` or `--redundant` flag to produce a `Redundant Rules Report`:

[//]: # (spawn node build\src\apps\analyze.js data\redundant.txt -r)
~~~
$ node build\src\apps\analyze.js data\redundant.txt -r
Mode is denyOverrides.

============ Policy Report ============
Allowed routes:
  destination ip: 171.64.64.0/20
  protocol: except tcp, udp

  destination ip: 171.64.64.0/20
  destination port: except 445

  destination ip: 128.30.0.0/15

============ Redundant Rules Report ============
Redundant policy rules: 7, 11, 17

~~~

This report shows these rules on lines 7, 11, and 17 are redundant:
* **Line 7:** deny ip 10.0.0.0/8 any
* **Line 11:** allow ip any 171.64.64.0/21
* **Line 17:** deny tcp any 171.64.64.1 445

Note that one cannot necessarily erase all redundant rules and preserve policy semantics. Suppose, for example, that a rule was repeated. In this case, the `Redundant Rules Report` would show both copies of the repeated rule, but only one copy could be removed, while preserving policy semantics. Minimizing a rule set is an iterative process that involves scanning for redundant rules, removing one of these rules, and repeating until there are no remaining redundant rules.

Note that, for `data/redundant.txt`, we get a different answer, when we use `First-Applicable` convention:

[//]: # (spawn node build\src\apps\analyze.js data\redundant.txt -r -m=f)
~~~
$ node build\src\apps\analyze.js data\redundant.txt -r -m=f
Mode is firstApplicable.

============ Policy Report ============
Allowed routes:
  source ip: except 10.0.0.0/8
  destination ip: 128.30.0.0/15
  destination port: except 445

  source ip: except 10.0.0.0/8
  destination ip: 128.30.0.0/15
  protocol: except tcp, udp

  source ip: except 10.0.0.0/8
  destination ip: 171.64.64.0/20

============ Redundant Rules Report ============
Redundant policy rules: 11, 17

~~~

---
### [Next: Defining Universes](./defining_universes.md)
