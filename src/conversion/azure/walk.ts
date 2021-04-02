import {AzureObjectBase, AzureTypedObject} from './azure_types';

///////////////////////////////////////////////////////////////////////////////
//
// Generator for all nodes of type AzureObjectBase in an Azure ResourceGraph.
//
///////////////////////////////////////////////////////////////////////////////
export function* walkAzureTypedObjects(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  root: any
): IterableIterator<AzureTypedObject> {
  if (root && typeof root === 'object') {
    // NOTE: cannot use destructuring here because `root` is `any`.
    const id = root.id;
    const name = root.name;
    const resourceGroup = root.resourceGroup;
    const type = root.type;

    // DESIGN NOTE: It seems that while most references only have id and name
    // it's possible Azure has some old classic references in which the reference
    // is strongly typeed. One case here is that properties could be looked for
    // however it's not determined that every object will have properties. This
    // implementation decided to check that all 4 properties are set and the object
    // has at least one or more additional properties
    // {
    //   id: '',
    //   type: 'microsoft.logic/workflows',
    //   resourceGroup: '',
    //   name: '',
    //   properties: {
    //     sku: {
    //       name: 'Standard',
    //       plan: {
    //         id: '',
    //         name: 'Default1',
    //         resourceGroup: 'Default-Web-EastUS',
    //         type: 'Microsoft.Web/ServerFarms',
    //       },
    //     },
    //   },
    // };
    const keyCount = Object.keys(root).length;

    if (id && name && resourceGroup && type && keyCount > 4) {
      yield root;
    }

    for (const key in root) {
      // https://eslint.org/docs/rules/no-prototype-builtins
      if (!Object.prototype.hasOwnProperty.call(root, key)) {
        continue;
      }

      yield* walkAzureTypedObjects(root[key]);
    }
  }
}

export function* walkAzureObjectBases(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  root: any
): IterableIterator<AzureObjectBase> {
  if (root && typeof root === 'object') {
    // NOTE: cannot use destructuring here because `root` is `any`.
    const id = root.id;
    const resourceGroup = root.resourceGroup;

    if (id && resourceGroup) {
      yield root;
    }
    for (const key in root) {
      // https://eslint.org/docs/rules/no-prototype-builtins
      if (!Object.prototype.hasOwnProperty.call(root, key)) {
        continue;
      }

      yield* walkAzureObjectBases(root[key]);
    }
  }
}
