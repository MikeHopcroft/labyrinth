# A Small Example

Most `labyrinth` functionality is available in the `analyze.js` command-line tool. You can run this tool with the `-h` flag to get help:

[//]: # (spawn node build\src\apps\analyze.js -h)
~~~
% node build/src/apps/analyze.js -h

Network rule analysis tool

  Utility for analyzing network security rules.

Usage

  node analyze.js <rules> [...options]

Required Parameters

  <rules>   Path to a csv, txt, or yaml file the defines a set of rules.

Options

  -a, --attribution line|id        Display rules attribution.
  -c, --contract <contract>        Compare the rule set in <contract> with those in
                                   <rules>.

  -m, --mode <mode>                Defines the rule evaluation strategy. Choices are
                                   denyOverridesand firstApplicable. Defaults to
                                   denyOverrides.
  -u, --universe <universe.yaml>   Use provided Universe specification.
                                   Default Universe is for firewall rules with
                                   - source ip
                                   - source port
                                   - destination ip
                                   - destination port
                                   - protocol

  -r, --reduncancy                 Display list of redundant policy rules.
  -t, --telemetry                  Display telemetry on boolean expression complexity.
~~~

Let's look at the sample policy in [data/sample1.txt](data/sample1.txt):

[//]: # (file data/sample1.txt)
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

## First applicable policy
[//]: # (spawn node build\src\apps\analyze.js data\sample1.txt -m=f)
~~~
% node build/src/apps/analyze.js data\sample1.txt -m=f
Mode is firstApplicable.

============ Policy Report ============
Allowed routes:
  source ip: except 10.0.0.0/8
  destination ip: 171.64.64.0/20

  source ip: except 10.0.0.0/8
  destination ip: 128.30.0.0/15
  protocol: except tcp, udp

  source ip: except 10.0.0.0/8
  destination ip: 128.30.0.0/15
  destination port: except 445
~~~

# Deny overrides policy
[//]: # (spawn node build\src\apps\analyze.js data\sample1.txt)
~~~
% node build/src/apps/analyze.js data\sample1.txt
Mode is denyOverrides.

============ Policy Report ============
Allowed routes:
  destination ip: 171.64.64.0/20
  protocol: except tcp, udp

  destination ip: 128.30.0.0/15

  destination ip: 171.64.64.0/20
  destination port: except 445
~~~

Rule attribution

[//]: # (spawn node build\src\apps\analyze.js data\sample1.txt -a)
~~~
node build\src\apps\analyze.js data\sample1.txt -a
Mode is denyOverrides.

============ Policy Report ============
Allowed routes:
  policy rules: 10, 13-14
  destination ip: 171.64.64.0/20
  protocol: except tcp, udp

  policy rules: 17
  destination ip: 128.30.0.0/15

  policy rules: 10, 13-14
  destination ip: 171.64.64.0/20
  destination port: except 445
~~~


---
### [Next: Policy Explanation](./policy_explanation.md)
