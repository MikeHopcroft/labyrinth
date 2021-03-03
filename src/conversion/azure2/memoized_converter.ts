// import {NodeSpec} from '../../graph';

// import {GraphServices} from './graph_services';
// import {AzureIPConfiguration, AzureLocalIP} from './types';

// function convertIpFactory() {
//   interface Memo {
//     node: NodeSpec;
//     sourceIp: string;
//   }

//   const idToMemo = new Map<string, Memo>();

//   return convertIpMemoized;

//   function convertIpMemoized(
//     services: GraphServices,
//     spec: AzureLocalIP,
//     otherNodeKey: string
//   ): string {
//     const memo = idToMemo.get(spec.id);
//     if (memo) {
//     } else {
//       const nodeKey = spec.id;
//       const sourceIp = spec.properties.privateIPAddress;
//       const node: NodeSpec = {
//         key: nodeKey,
//         routes: [],
//       };
//     }
//   }
// }
