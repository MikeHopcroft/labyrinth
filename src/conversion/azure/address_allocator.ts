import * as ip from 'ip';

export class AddressAllocator {
  private readonly subnets: Map<string, SubnetAllocation>;

  constructor() {
    this.subnets = new Map<string, SubnetAllocation>();
  }

  registerSubnet(subnetId: string, subnetCIDR: string) {
    if (!this.subnets.has(subnetId)) {
      this.subnets.set(subnetId, new SubnetAllocation(subnetCIDR));
    }
  }

  allocate(subnetId: string, ipId: string): string {
    const allocator = this.getSubnet(subnetId);
    return allocator.allocate(ipId);
  }

  reserve(subnetId: string, ipId: string, ip: string): void {
    const allocator = this.getSubnet(subnetId);
    allocator.reserve(ipId, ip);
  }

  getSubnet(subnetId: string): SubnetAllocation {
    const result = this.subnets.get(subnetId);

    if (!result) {
      throw new TypeError(
        `Registration of subnet ${subnetId} has not happened`
      );
    }

    return result;
  }
}

class SubnetAllocation {
  private index: number;
  private readonly max: number;
  private readonly subnet: ip.SubnetInfo;
  private readonly ipsAllocated: Set<number>;
  private readonly idsToIps: Map<string, string>;

  constructor(cidr: string) {
    this.subnet = ip.cidrSubnet(cidr);
    this.ipsAllocated = new Set<number>();
    this.idsToIps = new Map<string, string>();

    this.index = ip.toLong(this.subnet.firstAddress);
    this.max = ip.toLong(this.subnet.lastAddress);
  }

  allocate(ipId: string): string {
    let newIp = this.idsToIps.get(ipId);

    if (!newIp) {
      while (this.ipsAllocated.has(this.index)) {
        this.index++;
      }

      if (this.index > this.max) {
        throw new TypeError(
          `Ran out of ips while attempting to allocate for ${ipId}`
        );
      }

      this.ipsAllocated.add(this.index);
      newIp = ip.fromLong(this.index);
      this.idsToIps.set(ipId, newIp);
    }

    return newIp;
  }

  reserve(ipId: string, ipToReserve: string) {
    const currentIp = this.idsToIps.get(ipId);

    if (currentIp) {
      if (currentIp !== ipToReserve) {
        throw new TypeError(
          `Two ips [${currentIp},${ipToReserve}] are reserved for the same id ${ipId}`
        );
      }
      return;
    }

    const longIp = ip.toLong(ipToReserve);

    if (longIp < this.index || longIp > this.max) {
      throw new TypeError(
        `Ip address ${ipToReserve} is outside of the requested subnet`
      );
    }
    this.ipsAllocated.add(longIp);
    this.idsToIps.set(ipId, ipToReserve);
  }
}
