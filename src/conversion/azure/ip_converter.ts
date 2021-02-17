import {ForwardRuleSpec, NodeSpec} from '../../graph';
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
    store: IEntityStore<AnyAzureObject>
  ): NodeSpec[] {
    const result: NodeSpec[] = [];
    const ip = this.parseIpAddress(input as T);
    const key = store.getAlias(input.id);

    result.push({
      key,
      endpoint: true,
      range: {
        sourceIp: ip,
      },
      rules: this.parseSubnetRules(input as T, store),
    });

    return result;
  }

  private parseSubnetRules(
    input: T,
    store: IEntityStore<AnyAzureObject>
  ): ForwardRuleSpec[] {
    const rules: ForwardRuleSpec[] = [];

    const subnetId = this.parseSubnetId(input as T);

    if (subnetId) {
      const subnet = store.getAlias(subnetId);

      rules.push({
        destinationIp: subnet,
        destination: subnet,
      });
    }

    return rules;
  }

  protected abstract parseIpAddress(input: T): string;

  protected abstract parseSubnetId(input: T): string | undefined;
}

export class PublicIpConverter extends BaseIpConverter<AzurePublicIp> {
  constructor() {
    super('microsoft.network/publicipaddresses');
  }

  protected parseIpAddress(input: AzurePublicIp): string {
    return input.properties.ipAddress;
  }

  protected parseSubnetId(input: AzurePublicIp): string | undefined {
    return input.properties.subnet?.id;
  }
}

export class LocalIpConverter extends BaseIpConverter<AzureLocalIP> {
  constructor() {
    super('Microsoft.Network/networkInterfaces/ipConfigurations');
  }

  protected parseIpAddress(input: AzureLocalIP): string {
    return input.properties.privateIPAddress;
  }

  protected parseSubnetId(input: AzureLocalIP): string | undefined {
    return input.properties.subnet?.id;
  }
}
