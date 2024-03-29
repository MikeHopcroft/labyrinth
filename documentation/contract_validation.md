# Contract Validation

Often times it is useful to determine whether a certain `policy` satisfies a `contract`. We can use the `-c` or `--contract` flag to provide a contract file. Like the policy, the contract is expressed as a set of rules and can be encoded as text or YAML.

Let's compare `data/policy.txt` with itself:

[//]: # (script labyrinth firewall data\policy.txt -c=data\policy.txt)
~~~
$ labyrinth firewall data\policy.txt -c=data\policy.txt
Mode is denyOverrides.

============ Contract Validation Report ============
The policy and contract are equivalent


~~~

Not surprisingly, `labyrinth` reports that the policy has the same semantics as the contract.

Now consider the contract in `data/contract1.txt`:

[//]: # (file data/contract1.txt)
~~~
# The first line defines the fields in the remaining lines
action protocol sourceIp destinationIp destinationPort

# Subsequent lines define individual rules

# Isolating private addresses
deny ip 10.0.0.0/8 any

# permits for IPs without port and protocol blocks
allow ip any 171.64.64.0/18

# standard port and protocol blocks
deny tcp any any 445
deny udp any any 445

# permits for IPs with port and protocol blocks
allow ip any 128.30.0.0/15

~~~

This contract differs from the policy in that the CIDR block on line 10 has been broadened from `171.64.64.0/20` to `171.64.64.0/18`. So the contract allows more routes than that policy:

[//]: # (script labyrinth firewall data\policy.txt -c=data\contract1.txt)
~~~
$ labyrinth firewall data\policy.txt -c=data\contract1.txt
Mode is denyOverrides.

============ Contract Validation Report ============
All routes in policy are also in contract.

Routes in contract that are not in policy:
  source ip: except 10.0.0.0/8
  destination ip: 171.64.80.0-171.64.127.255

Routes common to policy and contract:
  source ip: except 10.0.0.0/8
  destination ip: 171.64.64.0/20

  source ip: except 10.0.0.0/8
  destination ip: 128.30.0.0/15
  destination port: except 445

  source ip: except 10.0.0.0/8
  destination ip: 128.30.0.0/15
  protocol: except tcp, udp


~~~

Now let's add some restrictions to the contract. In `data/contract2.txt`, we have added two more deny rules, on lines 15 and 16:
* deny tcp any any 593
* deny udp any any 593

Here's the updated contract file:

[//]: # (file data/contract2.txt)
~~~
# The first line defines the fields in the remaining lines
action protocol sourceIp destinationIp destinationPort

# Subsequent lines define individual rules

# Isolating private addresses
deny ip 10.0.0.0/8 any

# permits for IPs without port and protocol blocks
allow ip any 171.64.64.0/18

# standard port and protocol blocks
deny tcp any any 445
deny udp any any 445
deny tcp any any 593
deny udp any any 593

# permits for IPs with port and protocol blocks
allow ip any 128.30.0.0/15

~~~

We expect that `data/contract2.txt` will exclude some of the routes that were allowed in `data/policy.txt`:

[//]: # (script labyrinth firewall data\policy.txt -c=data\contract2.txt)
~~~
$ labyrinth firewall data\policy.txt -c=data\contract2.txt
Mode is denyOverrides.

============ Contract Validation Report ============
Routes in policy that are not in contract:
  source ip: except 10.0.0.0/8
  destination ip: 128.30.0.0/15
  destination port: 593
  protocol: tcp, udp

Routes in contract that are not in policy:
  source ip: except 10.0.0.0/8
  destination ip: 171.64.80.0-171.64.127.255

Routes common to policy and contract:
  source ip: except 10.0.0.0/8
  destination ip: 171.64.64.0/20

  source ip: except 10.0.0.0/8
  destination ip: 128.30.0.0/15
  destination port: except 445, 593

  source ip: except 10.0.0.0/8
  destination ip: 128.30.0.0/15
  protocol: except tcp, udp


~~~

We can also compare the first contract with the second:

[//]: # (script labyrinth firewall data\contract1.txt -c=data\contract2.txt)
~~~
$ labyrinth firewall data\contract1.txt -c=data\contract2.txt
Mode is denyOverrides.

============ Contract Validation Report ============
Routes in policy that are not in contract:
  source ip: except 10.0.0.0/8
  destination ip: 128.30.0.0/15
  destination port: 593
  protocol: tcp, udp

All routes in contract are also in policy.

Routes common to policy and contract:
  source ip: except 10.0.0.0/8
  destination ip: 171.64.64.0/18

  source ip: except 10.0.0.0/8
  destination ip: 128.30.0.0/15
  destination port: except 445, 593

  source ip: except 10.0.0.0/8
  destination ip: 128.30.0.0/15
  protocol: except tcp, udp


~~~

## Rules Attribution for Contract Validation

You can use the `-a` or `--attribution` option with contract validation:

[//]: # (script labyrinth firewall data\policy.txt -c=data\contract2.txt -a)
~~~
$ labyrinth firewall data\policy.txt -c=data\contract2.txt -a
Mode is denyOverrides.

============ Contract Validation Report ============
Routes in policy that are not in contract:
  policy rules: 7, 13-14, 17
  contract rules: 7, 10, 13-16, 19
  source ip: except 10.0.0.0/8
  destination ip: 128.30.0.0/15
  destination port: 593
  protocol: tcp, udp

Routes in contract that are not in policy:
  contract rules: 7, 10
  policy rules: 7, 10, 13-14, 17
  source ip: except 10.0.0.0/8
  destination ip: 171.64.80.0-171.64.127.255

Routes common to policy and contract:
  policy rules: 7, 10
  contract rules: 7, 10
  source ip: except 10.0.0.0/8
  destination ip: 171.64.64.0/20

  policy rules: 7, 13-14, 17
  contract rules: 7, 13-16, 19
  source ip: except 10.0.0.0/8
  destination ip: 128.30.0.0/15
  destination port: except 445, 593

  policy rules: 7, 13-14, 17
  contract rules: 7, 13-16, 19
  source ip: except 10.0.0.0/8
  destination ip: 128.30.0.0/15
  protocol: except tcp, udp


~~~

In this case, each conjunction is labeled with the set of rules from the `policy` and the set of rules from the `contract`.
At this time, the rules are referenced by line numbers in the input file.

## Policy Drift

One important scenario for `contract validation` is detecting `policy drift`. In this scenario, a continuous integration system
might examine the difference between the proposed policy and the existing policy, and force a security review and sign-off if the
semantics differ.

---
### [Next: Detecting Redundant Rules](./detecting_redundant_rules.md)
