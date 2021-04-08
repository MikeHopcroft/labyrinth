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
  for (const item of walkGraph<AzureTypedObject>(root)) {
    // NOTE: cannot use destructuring here because `root` is `any`.
    const id = item.id;
    const name = item.name;
    const resourceGroup = item.resourceGroup;
    const type = item.type;

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
    const keyCount = Object.keys(item).length;

    if (id && name && resourceGroup && type && keyCount > 4) {
      yield item;
    }
  }
}

export function* walkAzureObjectBases(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  root: any
): IterableIterator<AzureObjectBase> {
  for (const item of walkGraph<AzureObjectBase>(root)) {
    // NOTE: cannot use destructuring here because `root` is `any`.
    const id = item.id;
    const resourceGroup = item.resourceGroup;

    if (id && resourceGroup) {
      yield item;
    }
  }
}

export function* walkGraph<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  root: any
): IterableIterator<T> {
  if (root && typeof root === 'object') {
    yield root;

    for (const key in root) {
      // https://eslint.org/docs/rules/no-prototype-builtins
      if (!Object.prototype.hasOwnProperty.call(root, key)) {
        continue;
      }

      yield* walkGraph<T>(root[key]);
    }
  }
}
