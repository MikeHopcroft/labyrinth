* id shortening
  * BUG: Need to shorten ids on both AnyAzureObjects and AzureIdReference
  * QUESTION: shorten before conversion or after or reintroduce aliases?
    * Renaming inside of expressions may be complex.
* GraphServices
  * Consider extracting index as public property. Pass index to constructor instead of passing resource graph.
  * Consider extracting symbols as well.
* In vNetConverter - consider helper function for addressRange
* Trip hazard:   services.defineSymbol('ip', spec.id, sourceIp);
  * Consider defineServiceTag()
* BUG: isValidSymbol()
  * IF the convention is to use the Azure id as a service tag identifier, we need to either
    * Escape dash and comma
      * Converters will need to return two strings: nodeKey and serviceTag
    * Ensure that Azure never uses dash and comma.