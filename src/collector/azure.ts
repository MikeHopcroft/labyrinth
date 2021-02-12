import {ResourceGraphClient} from '@azure/arm-resourcegraph';
import {DefaultAzureCredential, TokenCredential} from '@azure/identity';
import {ServiceClientCredentials, WebResource} from '@azure/ms-rest-js';

// Temporary shim to allow modern @azure/identity credentials to be used with existing ARM libraries
class AzureIdentityCredentials implements ServiceClientCredentials {
  credential: TokenCredential;

  constructor(credential: TokenCredential = new DefaultAzureCredential()) {
    this.credential = credential;
  }

  public async signRequest(webResource: WebResource): Promise<WebResource> {
    const accessToken = await this.credential.getToken(
      'https://management.azure.com/'
    );
    webResource.headers.set('Authorization', `Bearer ${accessToken?.token}`);
    return webResource;
  }
}

///////////////////////////////////////////////////////////////////////////////
//
// Query Azure Resource Graph for a list of resources.
//
// https://docs.microsoft.com/en-us/azure/governance/resource-graph/concepts/query-language
//
///////////////////////////////////////////////////////////////////////////////
export async function queryResources(query: string, subscriptions: string[]) {
  const creds = new AzureIdentityCredentials();
  const client = new ResourceGraphClient(creds);
  const response = await client.resources({
    query,
    subscriptions,
  });

  // TODO: better type handling for resource graph response
  const columns: string[] = response.data.columns.map(
    (c: {name: any}) => c.name
  );
  const resources = [];
  for (const r of response.data.rows) {
    const obj: Record<string, any> = {};
    for (let i = 0; i < columns.length; i++) {
      obj[columns[i]] = r[i];
    }
    resources.push(obj);
  }
  return resources;
}
