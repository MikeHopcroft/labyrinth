import {NodeSpec} from '../../graph';
import {
  AnyAzureObject,
  AzurePublicIp,
  AzureLocalIP,
  BaseAzureConverter,
} from '.';
import {IEntityStore} from '..';

export abstract class BaseIpConverter<
  T extends AnyAzureObject
> extends BaseAzureConverter {
  constructor(supprtedType: string) {
    super(supprtedType);
  }

  convert(
    input: AnyAzureObject,
    // eslint-disable-next-line  @typescript-eslint/no-unused-vars
    store: IEntityStore<AnyAzureObject>
  ): NodeSpec[] {
    const result: NodeSpec[] = [];
    const ip = this.parseIpAddress(input as T);
    const key = input.name;

    result.push({
      key,
      endpoint: true,
      range: {
        sourceIp: ip,
      },
      rules: [],
    });

    return result;
  }

  protected abstract parseIpAddress(input: T): string;
}

export class PublicIpConverter extends BaseIpConverter<AzurePublicIp> {
  constructor() {
    super('microsoft.network/publicipaddresses');
  }

  protected parseIpAddress(input: AzurePublicIp): string {
    return input.properties.ipAddress;
  }
}

export class LocalIpConverter extends BaseIpConverter<AzureLocalIP> {
  constructor() {
    super('Microsoft.Network/networkInterfaces/ipConfigurations');
  }

  protected parseIpAddress(input: AzureLocalIP): string {
    return input.properties.privateIPAddress;
  }
}
