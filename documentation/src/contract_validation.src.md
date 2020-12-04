# Contract Validation

Often times it is useful to determine whether a certain `policy` satisfies a `contract`. We can use the `-c` or `--contract` flag to provide a contract file.

Like the policy, the contract is expressed as a set of rules and can be encoded as text or YAML.

Let's compare `data/policy.txt` with itself:

[//]: # (spawn node build\src\apps\analyze.js data\policy.txt -c=data\policy.txt)
~~~
$ node build\src\apps\analyze.js data\policy.txt -c=data\policy.txt
Mode is denyOverrides.

============ Contract Validation Report ============
Rule sets r1 and r2 are equivalent


~~~

Not surprisingly, `labyrinth` reports that the policy is the same as the contract.

Now let's use the contract in `data/contract1.txt`:

[//]: # (file data/contract1.txt)
~~~
~~~

This contract differs from the policy in that the CIDR block on line 10 has been broadened from `171.64.64.0/20` to `171.64.64.0/18`. So the contract allows more routes than that policy:

[//]: # (spawn node build\src\apps\analyze.js data\policy.txt -c=data\contract1.txt)
~~~
~~~

Now let's add some restrictions to the contract. In `data/contract2.txt`, we add two more deny rules, on lines 15 and 16:
* deny tcp any any 593
* deny udp any any 593

Here's the updated contract file:

[//]: # (file data/contract2.txt)
~~~
~~~

We expect that `data/contract2.txt` will exclude some routes that were allowed in `data/policy.txt`:

[//]: # (spawn node build\src\apps\analyze.js data\policy.txt -c=data\contract2.txt)
~~~
~~~

We can also compare the first contract with the second:

[//]: # (spawn node build\src\apps\analyze.js data\contract1.txt -c=data\contract2.txt)
~~~
~~~

## Rules Attribution

[//]: # (spawn node build\src\apps\analyze.js data\policy.txt -c=data\contract2.txt -a)
~~~
~~~

## Policy Drift

---
### [Next: Policy Drift](./policy_drift.md)
