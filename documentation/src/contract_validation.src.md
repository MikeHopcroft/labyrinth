# Contract Validation

Often times it is useful to determine whether a certain `policy` satisfies a `contract`. We can use the `-c` or `--contract` flag to provide a contract file. Like the policy, the contract is expressed as a set of rules and can be encoded as text or YAML.

Let's compare `data/policy.txt` with itself:

[//]: # (script labyrinth firewall data\policy.txt -c=data\policy.txt)
~~~
$ node build\src\apps\analyze.js data\policy.txt -c=data\policy.txt
Mode is denyOverrides.

============ Contract Validation Report ============
Rule sets r1 and r2 are equivalent


~~~

Not surprisingly, `labyrinth` reports that the policy has the same semantics as the contract.

Now consider the contract in `data/contract1.txt`:

[//]: # (file data/contract1.txt)
~~~
~~~

This contract differs from the policy in that the CIDR block on line 10 has been broadened from `171.64.64.0/20` to `171.64.64.0/18`. So the contract allows more routes than that policy:

[//]: # (script labyrinth firewall data\policy.txt -c=data\contract1.txt)
~~~
~~~

Now let's add some restrictions to the contract. In `data/contract2.txt`, we have added two more deny rules, on lines 15 and 16:
* deny tcp any any 593
* deny udp any any 593

Here's the updated contract file:

[//]: # (file data/contract2.txt)
~~~
~~~

We expect that `data/contract2.txt` will exclude some of the routes that were allowed in `data/policy.txt`:

[//]: # (script labyrinth firewall data\policy.txt -c=data\contract2.txt)
~~~
~~~

We can also compare the first contract with the second:

[//]: # (script labyrinth firewall data\contract1.txt -c=data\contract2.txt)
~~~
~~~

## Rules Attribution for Contract Validation

You can use the `-a` or `--attribution` option with contract validation:

[//]: # (script labyrinth firewall data\policy.txt -c=data\contract2.txt -a)
~~~
~~~

In this case, each conjunction is labeled with the set of rules from the `policy` and the set of rules from the `contract`.
At this time, the rules are referenced by line numbers in the input file.

## Policy Drift

One important scenario for `contract validation` is detecting `policy drift`. In this scenario, a continuous integration system
might examine the difference between the proposed policy and the existing policy, and force a security review and sign-off if the
semantics differ.

---
### [Next: Detecting Redundant Rules](./detecting_redundant_rules.md)
