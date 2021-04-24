# Labyrinth CLI

The `Labyrinth` network analyzer is based on a rules engine that evaluates packet filtering and routing rules at each node in the graph. Most of this node-level functionality is available in the `analyze.js` command-line tool. You can run this tool with the `-h` flag to get help:

[//]: # (spawn node build\src\apps\analyze.js -h)
~~~
$ node build\src\apps\analyze.js -h

Network rule analysis tool

  Utility for analyzing network security rules. 

Usage

  node analyze.js <rules> [...options] 

Required Parameters

  <rules>   Path to a csv, txt, or yaml file the defines a set of rules. 

Options

  -a, --attribution line|id        Display rules attribution.                   
  -c, --contract <contract>        Compare the rule set in <contract> with      
                                   those in <rules>.                            
                                                                                
  -m, --mode <mode>                Defines the rule evaluation strategy.        
                                   Choices are denyOverrides (or d) and         
                                   firstApplicable (or f). Defaults to          
                                   denyOverrides.                               
  -u, --universe <universe.yaml>   Use provided Universe specification.         
                                   Default Universe is for firewall rules with  
                                   - source ip                                  
                                   - source port                                
                                   - destination ip                             
                                   - destination port                           
                                   - protocol                                   
                                                                                
  -r, --reduncancy                 Display list of redundant policy rules.      
  -t, --telemetry                  Display telemetry on boolean expression      
                                   complexity.                                  
  -h, --help                       Display help message.                        


~~~

---
### [Next: Policy Explanation](./policy_explanation.md)
