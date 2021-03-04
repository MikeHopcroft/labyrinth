import {
  AnyAzureObject,
  AzureNetworkSecurityGroup,
  AzureObjectType,
  AzureResourceGraph,
  AzureVirtualNetwork,
} from '../../../src/conversion/azure2/types';

export class ResourceGraphOracle {
  static ValidVnet(): AzureVirtualNetwork {
    const vnet: AzureVirtualNetwork = {
      id:
        '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testing-network-testing/providers/Microsoft.Network/virtualNetworks/VNET-B',
      name: 'VNET-B',
      properties: {
        addressSpace: {
          addressPrefixes: ['172.18.0.0/28'],
        },
        subnets: [
          {
            id:
              '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testing-network-testing/providers/Microsoft.Network/virtualNetworks/VNET-B/subnets/A',
            name: 'A',
            properties: {
              addressPrefix: '172.18.0.0/28',
              ipConfigurations: [],
              networkSecurityGroup: {
                id:
                  '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testing-network-testing/providers/Microsoft.Network/networkSecurityGroups/TestSecurityGroup',
                resourceGroup: 'testing-network-testing',
              },
            },
            resourceGroup: 'testing-network-testing',
            type: AzureObjectType.SUBNET,
          },
        ],
      },
      resourceGroup: 'testing-network-testing',
      type: AzureObjectType.VIRTUAL_NETWORK,
    };
    return vnet;
  }

  static ValidVnetGraph(): AnyAzureObject[] {
    const nsg: AzureNetworkSecurityGroup = {
      id:
        '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testing-network-testing/providers/Microsoft.Network/networkSecurityGroups/TestSecurityGroup',
      name: 'TestSecurityGroup',
      properties: {
        defaultSecurityRules: [
          {
            id:
              '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testing-network-testing/providers/Microsoft.Network/networkSecurityGroups/TestSecurityGroup/defaultSecurityRules/AllowVnetInBound',
            name: 'AllowVnetInBound',
            properties: {
              access: 'Allow',
              destinationAddressPrefix: 'VirtualNetwork',
              destinationAddressPrefixes: [],
              destinationPortRange: '*',
              destinationPortRanges: [],
              direction: 'Inbound',
              priority: 65000,
              protocol: '*',
              sourceAddressPrefix: 'VirtualNetwork',
              sourceAddressPrefixes: [],
              sourcePortRange: '*',
              sourcePortRanges: [],
            },
            resourceGroup: 'testing-network-testing',
            type: AzureObjectType.DEFAULT_SECURITY_RULE,
          },
        ],
        subnets: [],
        securityRules: [],
      },
      resourceGroup: 'testing-network-testing',
      type: AzureObjectType.NSG,
    };
    return [nsg, this.ValidVnet()];
  }

  static LoadBalancerGraph(): AzureResourceGraph {
    const graph = [
      {
        extendedLocation: null,
        id:
          '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ERICMAI-VNET-LOADBALANCER/providers/Microsoft.Compute/disks/ericmai-lb-test-01_OsDisk_1_eeadee5fba85430a83ad1707d03fd219',
        identity: null,
        kind: '',
        location: 'southcentralus',
        managedBy:
          '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Compute/virtualMachines/ericmai-lb-test-01',
        name: 'ericmai-lb-test-01_OsDisk_1_eeadee5fba85430a83ad1707d03fd219',
        plan: null,
        properties: {
          creationData: {
            createOption: 'FromImage',
            imageReference: {
              id:
                '/Subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/Providers/Microsoft.Compute/Locations/southcentralus/Publishers/Canonical/ArtifactTypes/VMImage/Offers/UbuntuServer/Skus/18.04-LTS/Versions/18.04.202101290',
            },
          },
          diskIOPSReadWrite: 120,
          diskMBpsReadWrite: 25,
          diskSizeBytes: 32213303296,
          diskSizeGB: 30,
          diskState: 'Attached',
          encryption: {
            type: 'EncryptionAtRestWithPlatformKey',
          },
          hyperVGeneration: 'V1',
          osType: 'Linux',
          provisioningState: 'Succeeded',
          timeCreated: '2021-02-25T20:50:45.8440000Z',
          uniqueId: 'eeadee5f-ba85-430a-83ad-1707d03fd219',
        },
        resourceGroup: 'ericmai-vnet-loadbalancer',
        sku: {
          name: 'Premium_LRS',
          tier: 'Premium',
        },
        subscriptionId: 'b8dc8f25-7e85-4e7e-bde2-3d621b696e9b',
        tags: null,
        tenantId: '72f988bf-86f1-41af-91ab-2d7cd011db47',
        type: 'microsoft.compute/disks',
        zones: null,
      },
      {
        extendedLocation: null,
        id:
          '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ERICMAI-VNET-LOADBALANCER/providers/Microsoft.Compute/virtualMachines/ericmai-lb-test-01',
        identity: null,
        kind: '',
        location: 'southcentralus',
        managedBy: '',
        name: 'ericmai-lb-test-01',
        plan: null,
        properties: {
          availabilitySet: {
            id:
              '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ERICMAI-VNET-LOADBALANCER/providers/Microsoft.Compute/availabilitySets/ERICMAI-AVAIL-SET',
            resourceGroup: 'ERICMAI-VNET-LOADBALANCER',
          },
          diagnosticsProfile: {
            bootDiagnostics: {
              enabled: true,
            },
          },
          extended: {
            instanceView: {
              computerName: 'ericmai-lb-test-01',
              powerState: {
                code: 'PowerState/running',
                displayStatus: 'VM running',
                level: 'Info',
              },
            },
          },
          hardwareProfile: {
            vmSize: 'Standard_DS1_v2',
          },
          networkProfile: {
            networkInterfaces: [
              {
                id:
                  '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/networkInterfaces/ericmai-lb-test-01540',
                resourceGroup: 'ericmai-vnet-loadbalancer',
              },
            ],
          },
          osProfile: {
            adminUsername: 'azureuser',
            allowExtensionOperations: true,
            computerName: 'ericmai-lb-test-01',
            linuxConfiguration: {
              disablePasswordAuthentication: true,
              patchSettings: {
                patchMode: 'ImageDefault',
              },
              provisionVMAgent: true,
              ssh: {
                publicKeys: [
                  {
                    keyData:
                      'ssh-rsa AAAAB3NzaC1yc2EAAAABJQAAAQEAprw3sCsgCFooSma5AGjckh/ZhpoOIFWO0bF9tdZQfu5OsSqxQZhQmpcx3W0D1LSzVo1BNjScrJ+/xXCszkLwTbbbf6b72gt1YeA45cV8ikqZpzXSifPginMp5As3JEPWbBvKcCAU8DpICSsXJvAeFC+4BLXbrHQmTWiD5bJQl7BcujtyQtHaXQ2dyZWehiEKvgKHFZIgrGUZdMM2qR7FhtC7GXkG1LplFnK1rVDUdq5nq7JTlu7Nh93eZ+QRxaBGnJeIcCndEfEBw9MSPOecD7oDsYg8ndZw6gzdPxFPRUIjyllPDtuOFP/UwcahHU1UksqxUgN+CbdgpSuYNPSHNQ== dev-machine',
                    path: '/home/azureuser/.ssh/authorized_keys',
                  },
                ],
              },
            },
            requireGuestProvisionSignal: true,
            secrets: [],
          },
          provisioningState: 'Updating',
          storageProfile: {
            dataDisks: [],
            imageReference: {
              exactVersion: '18.04.202101290',
              offer: 'UbuntuServer',
              publisher: 'Canonical',
              sku: '18.04-LTS',
              version: 'latest',
            },
            osDisk: {
              caching: 'ReadWrite',
              createOption: 'FromImage',
              diskSizeGB: 30,
              managedDisk: {
                id:
                  '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Compute/disks/ericmai-lb-test-01_OsDisk_1_eeadee5fba85430a83ad1707d03fd219',
                resourceGroup: 'ericmai-vnet-loadbalancer',
                storageAccountType: 'Premium_LRS',
              },
              name:
                'ericmai-lb-test-01_OsDisk_1_eeadee5fba85430a83ad1707d03fd219',
              osType: 'Linux',
            },
          },
          vmId: '392c8c54-8212-41a4-a844-2eeb2b8a8957',
        },
        resourceGroup: 'ericmai-vnet-loadbalancer',
        sku: null,
        subscriptionId: 'b8dc8f25-7e85-4e7e-bde2-3d621b696e9b',
        tags: null,
        tenantId: '72f988bf-86f1-41af-91ab-2d7cd011db47',
        type: 'microsoft.compute/virtualmachines',
        zones: null,
      },
      {
        extendedLocation: null,
        id:
          '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ERICMAI-VNET-LOADBALANCER/providers/Microsoft.Compute/virtualMachines/ericmai-lb-test-01/extensions/OmsAgentForLinux',
        identity: null,
        kind: '',
        location: 'southcentralus',
        managedBy: '',
        name: 'OmsAgentForLinux',
        plan: null,
        properties: {
          autoUpgradeMinorVersion: true,
          provisioningState: 'Succeeded',
          publisher: 'Microsoft.EnterpriseCloud.Monitoring',
          settings: {
            workspaceId: 'def41435-0627-48a7-9595-36d570902c46',
          },
          type: 'OmsAgentForLinux',
          typeHandlerVersion: '1.0',
        },
        resourceGroup: 'ericmai-vnet-loadbalancer',
        sku: null,
        subscriptionId: 'b8dc8f25-7e85-4e7e-bde2-3d621b696e9b',
        tags: null,
        tenantId: '72f988bf-86f1-41af-91ab-2d7cd011db47',
        type: 'microsoft.compute/virtualmachines/extensions',
        zones: null,
      },
      {
        extendedLocation: null,
        id:
          '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ERICMAI-VNET-LOADBALANCER/providers/Microsoft.Compute/virtualMachines/ericmai-lb-test-01/extensions/QualysAgentLinux',
        identity: null,
        kind: '',
        location: 'southcentralus',
        managedBy: '',
        name: 'QualysAgentLinux',
        plan: null,
        properties: {
          autoUpgradeMinorVersion: false,
          provisioningState: 'Succeeded',
          publisher: 'Qualys',
          settings: {
            LicenseCode:
              'eyJjaWQiOiI2YzYyM2NjNC1iNWFlLWVlZjQtODEzMS03NDJlOGU5ZTM5OTUiLCJhaWQiOiI5MGVmMGEyMS00YTljLTQ5YWUtYjQyMS00MDc4NzM3Zjk1NDciLCJwd3NVcmwiOiJodHRwczovL3FhZ3B1YmxpYy5xZzMuYXBwcy5xdWFseXMuY29tL0Nsb3VkQWdlbnQvIiwicHdzUG9ydCI6IjQ0MyJ9',
            Logging: {
              ApplianceID: '675c5fb5-83e3-4fa0-a7fa-99bdd0e738a6',
              ConnectionInfo: {
                EventHubName:
                  'ig9u/i0ZIO2AMRM/zhjjds4IX4CA4a1j/qb/fMBP4IeDzioze0e1aJGOejMksCig92iR2kytlysQNyeQbXvrgCBPypYnDUINdK78txIZlxIIQvCCZXwAFIsr3aJTqzaNTOrf9GxLeyWybJ8HoWmkqb25JzT0KuYGSz3qYL+QyXk=',
                PolicyName:
                  'AqEXRR13c2LHuPPba41yfGjqSurcdJrbSFptinqPtfj/qnYiNTyXhw6WHJCG9w2Yv9A/yFXS9zPBP3X0tkpW+dY5sB5DB2s6rdWUOa5LBbOB385npdesXFSiAeg+BXx4kBoJjg2C4jwgKMiA7yKxOuJDNp1em2oKEUdUW/l2Vec=',
                PolicySASKey:
                  'fG6RaEysH52IV4O8JHv6Ap4DhZaXRqILawqgmqo2kgiiqO70a7AeQavg7pWBSSreBEgrJj+73waXdgpUqN5aBKpSAaO/UZQn+sNF8dCNFNXTmEBCQ4yD6sPMooXlYjCbpaKPksVlbD9RrS4mqtiIz9/jvtBv0o0t0cqQCij2BvE=',
                ServiceBusNamespace:
                  'J1J5CPCRtMMmKgY7VEJR/E+v7JhQdkkjPdgsYYXLLHU3F09BvHAwXuaALLelOY+mtudui9mjlaS4FHMQVKGH7wZiqBW1uyA1DegAQVXpPpMArd3QUlINQqNNbwFEbXqjfhC0XPddSMngP0NkC2wvmVUk07OFEBroBQN0U2DWT+M=',
              },
              LoggingLevel: 'Alert',
              Template: 'CEF',
            },
            ResourceID:
              '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ERICMAI-VNET-LOADBALANCER/providers/Microsoft.Compute/virtualMachines/ericmai-lb-test-01',
            VmRegion: 'southcentralus',
          },
          type: 'QualysAgentLinux',
          typeHandlerVersion: '1.6',
        },
        resourceGroup: 'ericmai-vnet-loadbalancer',
        sku: null,
        subscriptionId: 'b8dc8f25-7e85-4e7e-bde2-3d621b696e9b',
        tags: null,
        tenantId: '72f988bf-86f1-41af-91ab-2d7cd011db47',
        type: 'microsoft.compute/virtualmachines/extensions',
        zones: null,
      },
      {
        extendedLocation: null,
        id:
          '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Compute/availabilitySets/ericmai-avail-set',
        identity: null,
        kind: '',
        location: 'southcentralus',
        managedBy: '',
        name: 'ericmai-avail-set',
        plan: null,
        properties: {
          platformFaultDomainCount: 1,
          platformUpdateDomainCount: 1,
          virtualMachines: [
            {
              id:
                '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ERICMAI-VNET-LOADBALANCER/providers/Microsoft.Compute/virtualMachines/ERICMAI-LB-TEST-01',
              resourceGroup: 'ERICMAI-VNET-LOADBALANCER',
            },
          ],
        },
        resourceGroup: 'ericmai-vnet-loadbalancer',
        sku: {
          name: 'Aligned',
        },
        subscriptionId: 'b8dc8f25-7e85-4e7e-bde2-3d621b696e9b',
        tags: {},
        tenantId: '72f988bf-86f1-41af-91ab-2d7cd011db47',
        type: 'microsoft.compute/availabilitysets',
        zones: null,
      },
      {
        extendedLocation: null,
        id:
          '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Compute/virtualMachineScaleSets/ericmai',
        identity: null,
        kind: '',
        location: 'southcentralus',
        managedBy: '',
        name: 'ericmai',
        plan: null,
        properties: {
          doNotRunExtensionsOnOverprovisionedVMs: false,
          overprovision: true,
          platformFaultDomainCount: 5,
          provisioningState: 'Succeeded',
          scaleInPolicy: {
            rules: ['Default'],
          },
          singlePlacementGroup: true,
          uniqueId: '4a29c641-5948-4947-8fa6-8d8ee9fec9a5',
          upgradePolicy: {
            mode: 'Manual',
          },
          virtualMachineProfile: {
            diagnosticsProfile: {
              bootDiagnostics: {
                enabled: true,
              },
            },
            extensionProfile: {
              extensions: [],
            },
            licenseType: 'Windows_Client',
            networkProfile: {
              networkInterfaceConfigurations: [
                {
                  name: 'ericmai-vnet-loadbalancer-vnet-nic01',
                  properties: {
                    dnsSettings: {
                      dnsServers: [],
                    },
                    enableAcceleratedNetworking: false,
                    enableIPForwarding: false,
                    ipConfigurations: [
                      {
                        name:
                          'ericmai-vnet-loadbalancer-vnet-nic01-defaultIpConfiguration',
                        properties: {
                          loadBalancerBackendAddressPools: [
                            {
                              id:
                                '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/backendAddressPools/bepool',
                              resourceGroup: 'ericmai-vnet-loadbalancer',
                            },
                          ],
                          loadBalancerInboundNatPools: [
                            {
                              id:
                                '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/inboundNatPools/natpool',
                              resourceGroup: 'ericmai-vnet-loadbalancer',
                            },
                          ],
                          primary: true,
                          privateIPAddressVersion: 'IPv4',
                          subnet: {
                            id:
                              '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/virtualNetworks/ericmai-vnet-loadbalancer-vnet/subnets/default',
                            resourceGroup: 'ericmai-vnet-loadbalancer',
                          },
                        },
                      },
                    ],
                    networkSecurityGroup: {
                      id:
                        '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/networkSecurityGroups/basicNsgericmai-vnet-loadbalancer-vnet-nic01',
                      resourceGroup: 'ericmai-vnet-loadbalancer',
                    },
                    primary: true,
                  },
                },
              ],
            },
            osProfile: {
              adminUsername: 'eric-admin',
              allowExtensionOperations: true,
              computerNamePrefix: 'ericmaigc',
              requireGuestProvisionSignal: true,
              secrets: [],
              windowsConfiguration: {
                enableAutomaticUpdates: true,
                provisionVMAgent: true,
              },
            },
            priority: 'Regular',
            storageProfile: {
              imageReference: {
                offer: 'Windows-10',
                publisher: 'MicrosoftWindowsDesktop',
                sku: '20h1-pro',
                version: 'latest',
              },
              osDisk: {
                caching: 'ReadWrite',
                createOption: 'FromImage',
                diskSizeGB: 127,
                managedDisk: {
                  storageAccountType: 'StandardSSD_LRS',
                },
                osType: 'Windows',
              },
            },
          },
        },
        resourceGroup: 'ericmai-vnet-loadbalancer',
        sku: {
          capacity: 1,
          name: 'Standard_DS1_v2',
          tier: 'Standard',
        },
        subscriptionId: 'b8dc8f25-7e85-4e7e-bde2-3d621b696e9b',
        tags: null,
        tenantId: '72f988bf-86f1-41af-91ab-2d7cd011db47',
        type: 'microsoft.compute/virtualmachinescalesets',
        zones: null,
      },
      {
        extendedLocation: null,
        id:
          '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Compute/virtualMachineScaleSets/ericmai-linux',
        identity: null,
        kind: '',
        location: 'southcentralus',
        managedBy: '',
        name: 'ericmai-linux',
        plan: null,
        properties: {
          doNotRunExtensionsOnOverprovisionedVMs: false,
          overprovision: true,
          platformFaultDomainCount: 5,
          provisioningState: 'Succeeded',
          scaleInPolicy: {
            rules: ['Default'],
          },
          singlePlacementGroup: true,
          uniqueId: '56e49eda-6587-455c-9ce6-73fc504015fe',
          upgradePolicy: {
            mode: 'Manual',
          },
          virtualMachineProfile: {
            diagnosticsProfile: {
              bootDiagnostics: {
                enabled: true,
              },
            },
            extensionProfile: {
              extensions: [],
            },
            networkProfile: {
              networkInterfaceConfigurations: [
                {
                  name: 'ericmai-vnet-loadbalancer-vnet-nic01',
                  properties: {
                    dnsSettings: {
                      dnsServers: [],
                    },
                    enableAcceleratedNetworking: false,
                    enableIPForwarding: false,
                    ipConfigurations: [
                      {
                        name:
                          'ericmai-vnet-loadbalancer-vnet-nic01-defaultIpConfiguration',
                        properties: {
                          loadBalancerBackendAddressPools: [
                            {
                              id:
                                '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/backendAddressPools/linux-pool',
                              resourceGroup: 'ericmai-vnet-loadbalancer',
                            },
                          ],
                          primary: true,
                          privateIPAddressVersion: 'IPv4',
                          subnet: {
                            id:
                              '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/virtualNetworks/ericmai-vnet-loadbalancer-vnet/subnets/default',
                            resourceGroup: 'ericmai-vnet-loadbalancer',
                          },
                        },
                      },
                    ],
                    networkSecurityGroup: {
                      id:
                        '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/networkSecurityGroups/basicNsgericmai-vnet-loadbalancer-vnet-nic01',
                      resourceGroup: 'ericmai-vnet-loadbalancer',
                    },
                    primary: true,
                  },
                },
              ],
            },
            osProfile: {
              adminUsername: 'azureuser',
              allowExtensionOperations: true,
              computerNamePrefix: 'ericmai-l',
              linuxConfiguration: {
                disablePasswordAuthentication: true,
                provisionVMAgent: true,
                ssh: {
                  publicKeys: [
                    {
                      keyData:
                        'ssh-rsa AAAAB3NzaC1yc2EAAAABJQAAAQEAprw3sCsgCFooSma5AGjckh/ZhpoOIFWO0bF9tdZQfu5OsSqxQZhQmpcx3W0D1LSzVo1BNjScrJ+/xXCszkLwTbbbf6b72gt1YeA45cV8ikqZpzXSifPginMp5As3JEPWbBvKcCAU8DpICSsXJvAeFC+4BLXbrHQmTWiD5bJQl7BcujtyQtHaXQ2dyZWehiEKvgKHFZIgrGUZdMM2qR7FhtC7GXkG1LplFnK1rVDUdq5nq7JTlu7Nh93eZ+QRxaBGnJeIcCndEfEBw9MSPOecD7oDsYg8ndZw6gzdPxFPRUIjyllPDtuOFP/UwcahHU1UksqxUgN+CbdgpSuYNPSHNQ== dev-machine',
                      path: '/home/azureuser/.ssh/authorized_keys',
                    },
                  ],
                },
              },
              requireGuestProvisionSignal: true,
              secrets: [],
            },
            priority: 'Regular',
            storageProfile: {
              imageReference: {
                offer: 'UbuntuServer',
                publisher: 'Canonical',
                sku: '18.04-LTS',
                version: 'latest',
              },
              osDisk: {
                caching: 'ReadWrite',
                createOption: 'FromImage',
                diskSizeGB: 30,
                managedDisk: {
                  storageAccountType: 'Premium_LRS',
                },
                osType: 'Linux',
              },
            },
          },
        },
        resourceGroup: 'ericmai-vnet-loadbalancer',
        sku: {
          capacity: 1,
          name: 'Standard_DS1_v2',
          tier: 'Standard',
        },
        subscriptionId: 'b8dc8f25-7e85-4e7e-bde2-3d621b696e9b',
        tags: null,
        tenantId: '72f988bf-86f1-41af-91ab-2d7cd011db47',
        type: 'microsoft.compute/virtualmachinescalesets',
        zones: null,
      },
      {
        extendedLocation: null,
        id:
          '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.DevTestLab/schedules/shutdown-computevm-ericmai-lb-test-01',
        identity: null,
        kind: '',
        location: 'southcentralus',
        managedBy: '',
        name: 'shutdown-computevm-ericmai-lb-test-01',
        plan: null,
        properties: {
          createdDate: '2021-02-25T20:51:26.4640000Z',
          dailyRecurrence: {
            time: '2300',
          },
          notificationSettings: {
            notificationLocale: 'en',
            status: 'Disabled',
            timeInMinutes: 30,
          },
          provisioningState: 'Succeeded',
          status: 'Enabled',
          targetResourceId:
            '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Compute/virtualMachines/ericmai-lb-test-01',
          taskType: 'ComputeVmShutdownTask',
          timeZoneId: 'Pacific Standard Time',
          uniqueIdentifier: '9b35c34b-460f-452a-b048-847270881212',
        },
        resourceGroup: 'ericmai-vnet-loadbalancer',
        sku: null,
        subscriptionId: 'b8dc8f25-7e85-4e7e-bde2-3d621b696e9b',
        tags: null,
        tenantId: '72f988bf-86f1-41af-91ab-2d7cd011db47',
        type: 'microsoft.devtestlab/schedules',
        zones: null,
      },
      {
        extendedLocation: null,
        id:
          '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb',
        identity: null,
        kind: '',
        location: 'southcentralus',
        managedBy: '',
        name: 'ericmai-lb',
        plan: null,
        properties: {
          backendAddressPools: [
            {
              etag: 'W/"7549a72a-9e32-4208-8500-7773145c101d"',
              id:
                '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/backendAddressPools/bepool',
              name: 'bepool',
              properties: {
                backendIPConfigurations: [
                  {
                    id:
                      '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Compute/virtualMachineScaleSets/ericmai/virtualMachines/0/networkInterfaces/ericmai-vnet-loadbalancer-vnet-nic01/ipConfigurations/ericmai-vnet-loadbalancer-vnet-nic01-defaultIpConfiguration',
                    resourceGroup: 'ericmai-vnet-loadbalancer',
                  },
                ],
                loadBalancerBackendAddresses: [
                  {
                    etag: 'W/"7549a72a-9e32-4208-8500-7773145c101d"',
                    id:
                      '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/backendAddressPools/bepool/loadBalancerBackendAddresses/bd618d20-4287-4edb-8b7a-f657a7fcf667',
                    name: 'bd618d20-4287-4edb-8b7a-f657a7fcf667',
                    properties: {
                      networkInterfaceIPConfiguration: {
                        id:
                          '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Compute/virtualMachineScaleSets/ericmai/virtualMachines/0/networkInterfaces/ericmai-vnet-loadbalancer-vnet-nic01/ipConfigurations/ericmai-vnet-loadbalancer-vnet-nic01-defaultIpConfiguration',
                        resourceGroup: 'ericmai-vnet-loadbalancer',
                      },
                      provisioningState: 'Succeeded',
                    },
                    resourceGroup: 'ericmai-vnet-loadbalancer',
                    type:
                      'Microsoft.Network/loadBalancers/backendAddressPools/loadBalancerBackendAddresses',
                  },
                ],
                loadBalancingRules: [
                  {
                    id:
                      '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/loadBalancingRules/LBRule',
                    resourceGroup: 'ericmai-vnet-loadbalancer',
                  },
                ],
                provisioningState: 'Succeeded',
              },
              resourceGroup: 'ericmai-vnet-loadbalancer',
              type: 'Microsoft.Network/loadBalancers/backendAddressPools',
            },
            {
              etag: 'W/"7549a72a-9e32-4208-8500-7773145c101d"',
              id:
                '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/backendAddressPools/linux-pool',
              name: 'linux-pool',
              properties: {
                backendIPConfigurations: [
                  {
                    id:
                      '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Compute/virtualMachineScaleSets/ericmai-linux/virtualMachines/0/networkInterfaces/ericmai-vnet-loadbalancer-vnet-nic01/ipConfigurations/ericmai-vnet-loadbalancer-vnet-nic01-defaultIpConfiguration',
                    resourceGroup: 'ericmai-vnet-loadbalancer',
                  },
                ],
                loadBalancerBackendAddresses: [
                  {
                    etag: 'W/"7549a72a-9e32-4208-8500-7773145c101d"',
                    id:
                      '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/backendAddressPools/linux-pool/loadBalancerBackendAddresses/b56ff95a-2ccf-4090-9916-c1eafcbcfbb8',
                    name: 'b56ff95a-2ccf-4090-9916-c1eafcbcfbb8',
                    properties: {
                      networkInterfaceIPConfiguration: {
                        id:
                          '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Compute/virtualMachineScaleSets/ericmai-linux/virtualMachines/0/networkInterfaces/ericmai-vnet-loadbalancer-vnet-nic01/ipConfigurations/ericmai-vnet-loadbalancer-vnet-nic01-defaultIpConfiguration',
                        resourceGroup: 'ericmai-vnet-loadbalancer',
                      },
                      provisioningState: 'Succeeded',
                    },
                    resourceGroup: 'ericmai-vnet-loadbalancer',
                    type:
                      'Microsoft.Network/loadBalancers/backendAddressPools/loadBalancerBackendAddresses',
                  },
                ],
                provisioningState: 'Succeeded',
              },
              resourceGroup: 'ericmai-vnet-loadbalancer',
              type: 'Microsoft.Network/loadBalancers/backendAddressPools',
            },
            {
              etag: 'W/"7549a72a-9e32-4208-8500-7773145c101d"',
              id:
                '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/backendAddressPools/avail-set',
              name: 'avail-set',
              properties: {
                backendIPConfigurations: [
                  {
                    id:
                      '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/networkInterfaces/ericmai-lb-test-01540/ipConfigurations/ipconfig1',
                    resourceGroup: 'ericmai-vnet-loadbalancer',
                  },
                ],
                loadBalancerBackendAddresses: [
                  {
                    etag: 'W/"7549a72a-9e32-4208-8500-7773145c101d"',
                    id:
                      '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/backendAddressPools/avail-set/loadBalancerBackendAddresses/ericmai-vnet-loadbalancer_ericmai-lb-test-01540ipconfig1',
                    name:
                      'ericmai-vnet-loadbalancer_ericmai-lb-test-01540ipconfig1',
                    properties: {
                      networkInterfaceIPConfiguration: {
                        id:
                          '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/networkInterfaces/ericmai-lb-test-01540/ipConfigurations/ipconfig1',
                        resourceGroup: 'ericmai-vnet-loadbalancer',
                      },
                      provisioningState: 'Succeeded',
                    },
                    resourceGroup: 'ericmai-vnet-loadbalancer',
                    type:
                      'Microsoft.Network/loadBalancers/backendAddressPools/loadBalancerBackendAddresses',
                  },
                ],
                loadBalancingRules: [
                  {
                    id:
                      '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/loadBalancingRules/testing',
                    resourceGroup: 'ericmai-vnet-loadbalancer',
                  },
                ],
                provisioningState: 'Succeeded',
              },
              resourceGroup: 'ericmai-vnet-loadbalancer',
              type: 'Microsoft.Network/loadBalancers/backendAddressPools',
            },
          ],
          frontendIPConfigurations: [
            {
              etag: 'W/"7549a72a-9e32-4208-8500-7773145c101d"',
              id:
                '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/frontendIPConfigurations/LoadBalancerFrontEnd',
              name: 'LoadBalancerFrontEnd',
              properties: {
                inboundNatPools: [
                  {
                    id:
                      '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/inboundNatPools/natpool',
                    resourceGroup: 'ericmai-vnet-loadbalancer',
                  },
                ],
                inboundNatRules: [
                  {
                    id:
                      '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/inboundNatRules/natpool.0',
                    resourceGroup: 'ericmai-vnet-loadbalancer',
                  },
                ],
                loadBalancingRules: [
                  {
                    id:
                      '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/loadBalancingRules/LBRule',
                    resourceGroup: 'ericmai-vnet-loadbalancer',
                  },
                  {
                    id:
                      '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/loadBalancingRules/testing',
                    resourceGroup: 'ericmai-vnet-loadbalancer',
                  },
                ],
                privateIPAddressVersion: 'IPv4',
                privateIPAllocationMethod: 'Dynamic',
                provisioningState: 'Succeeded',
                publicIPAddress: {
                  id:
                    '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/publicIPAddresses/ericmai-ip',
                  resourceGroup: 'ericmai-vnet-loadbalancer',
                },
              },
              resourceGroup: 'ericmai-vnet-loadbalancer',
              type: 'Microsoft.Network/loadBalancers/frontendIPConfigurations',
            },
          ],
          inboundNatPools: [
            {
              etag: 'W/"7549a72a-9e32-4208-8500-7773145c101d"',
              id:
                '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/inboundNatPools/natpool',
              name: 'natpool',
              properties: {
                allowBackendPortConflict: false,
                backendPort: 3389,
                enableDestinationServiceEndpoint: false,
                enableFloatingIP: false,
                enableTcpReset: false,
                frontendIPConfiguration: {
                  id:
                    '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/frontendIPConfigurations/LoadBalancerFrontEnd',
                  resourceGroup: 'ericmai-vnet-loadbalancer',
                },
                frontendPortRangeEnd: 50119,
                frontendPortRangeStart: 50000,
                idleTimeoutInMinutes: 4,
                protocol: 'Tcp',
                provisioningState: 'Succeeded',
              },
              resourceGroup: 'ericmai-vnet-loadbalancer',
              type: 'Microsoft.Network/loadBalancers/inboundNatPools',
            },
          ],
          inboundNatRules: [
            {
              etag: 'W/"7549a72a-9e32-4208-8500-7773145c101d"',
              id:
                '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/inboundNatRules/natpool.0',
              name: 'natpool.0',
              properties: {
                allowBackendPortConflict: false,
                backendIPConfiguration: {
                  id:
                    '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Compute/virtualMachineScaleSets/ericmai/virtualMachines/0/networkInterfaces/ericmai-vnet-loadbalancer-vnet-nic01/ipConfigurations/ericmai-vnet-loadbalancer-vnet-nic01-defaultIpConfiguration',
                  resourceGroup: 'ericmai-vnet-loadbalancer',
                },
                backendPort: 3389,
                enableDestinationServiceEndpoint: false,
                enableFloatingIP: false,
                enableTcpReset: false,
                frontendIPConfiguration: {
                  id:
                    '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/frontendIPConfigurations/LoadBalancerFrontEnd',
                  resourceGroup: 'ericmai-vnet-loadbalancer',
                },
                frontendPort: 50000,
                idleTimeoutInMinutes: 4,
                protocol: 'Tcp',
                provisioningState: 'Succeeded',
              },
              resourceGroup: 'ericmai-vnet-loadbalancer',
              type: 'Microsoft.Network/loadBalancers/inboundNatRules',
            },
          ],
          loadBalancingRules: [
            {
              etag: 'W/"7549a72a-9e32-4208-8500-7773145c101d"',
              id:
                '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/loadBalancingRules/LBRule',
              name: 'LBRule',
              properties: {
                allowBackendPortConflict: false,
                backendAddressPool: {
                  id:
                    '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/backendAddressPools/bepool',
                  resourceGroup: 'ericmai-vnet-loadbalancer',
                },
                backendPort: 80,
                disableOutboundSnat: false,
                enableDestinationServiceEndpoint: false,
                enableFloatingIP: false,
                enableTcpReset: false,
                frontendIPConfiguration: {
                  id:
                    '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/frontendIPConfigurations/LoadBalancerFrontEnd',
                  resourceGroup: 'ericmai-vnet-loadbalancer',
                },
                frontendPort: 80,
                idleTimeoutInMinutes: 5,
                loadDistribution: 'Default',
                probe: {
                  id:
                    '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/probes/tcpProbe',
                  resourceGroup: 'ericmai-vnet-loadbalancer',
                },
                protocol: 'Tcp',
                provisioningState: 'Succeeded',
              },
              resourceGroup: 'ericmai-vnet-loadbalancer',
              type: 'Microsoft.Network/loadBalancers/loadBalancingRules',
            },
            {
              etag: 'W/"7549a72a-9e32-4208-8500-7773145c101d"',
              id:
                '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/loadBalancingRules/testing',
              name: 'testing',
              properties: {
                allowBackendPortConflict: false,
                backendAddressPool: {
                  id:
                    '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/backendAddressPools/avail-set',
                  resourceGroup: 'ericmai-vnet-loadbalancer',
                },
                backendPort: 22,
                disableOutboundSnat: false,
                enableDestinationServiceEndpoint: false,
                enableFloatingIP: false,
                enableTcpReset: false,
                frontendIPConfiguration: {
                  id:
                    '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/frontendIPConfigurations/LoadBalancerFrontEnd',
                  resourceGroup: 'ericmai-vnet-loadbalancer',
                },
                frontendPort: 8022,
                idleTimeoutInMinutes: 4,
                loadDistribution: 'Default',
                probe: {
                  id:
                    '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/probes/sshProbe',
                  resourceGroup: 'ericmai-vnet-loadbalancer',
                },
                protocol: 'Tcp',
                provisioningState: 'Succeeded',
              },
              resourceGroup: 'ericmai-vnet-loadbalancer',
              type: 'Microsoft.Network/loadBalancers/loadBalancingRules',
            },
          ],
          outboundRules: [],
          probes: [
            {
              etag: 'W/"7549a72a-9e32-4208-8500-7773145c101d"',
              id:
                '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/probes/tcpProbe',
              name: 'tcpProbe',
              properties: {
                intervalInSeconds: 5,
                loadBalancingRules: [
                  {
                    id:
                      '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/loadBalancingRules/LBRule',
                    resourceGroup: 'ericmai-vnet-loadbalancer',
                  },
                ],
                numberOfProbes: 2,
                port: 80,
                protocol: 'Tcp',
                provisioningState: 'Succeeded',
              },
              resourceGroup: 'ericmai-vnet-loadbalancer',
              type: 'Microsoft.Network/loadBalancers/probes',
            },
            {
              etag: 'W/"7549a72a-9e32-4208-8500-7773145c101d"',
              id:
                '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/probes/sshProbe',
              name: 'sshProbe',
              properties: {
                intervalInSeconds: 5,
                loadBalancingRules: [
                  {
                    id:
                      '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/loadBalancingRules/testing',
                    resourceGroup: 'ericmai-vnet-loadbalancer',
                  },
                ],
                numberOfProbes: 2,
                port: 22,
                protocol: 'Tcp',
                provisioningState: 'Succeeded',
              },
              resourceGroup: 'ericmai-vnet-loadbalancer',
              type: 'Microsoft.Network/loadBalancers/probes',
            },
          ],
          provisioningState: 'Succeeded',
          resourceGuid: '21078775-bd49-4ca8-ad7f-3ba3c6746d9d',
        },
        resourceGroup: 'ericmai-vnet-loadbalancer',
        sku: {
          name: 'Standard',
          tier: 'Regional',
        },
        subscriptionId: 'b8dc8f25-7e85-4e7e-bde2-3d621b696e9b',
        tags: null,
        tenantId: '72f988bf-86f1-41af-91ab-2d7cd011db47',
        type: 'microsoft.network/loadbalancers',
        zones: null,
      },
      {
        extendedLocation: null,
        id:
          '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/networkInterfaces/ericmai-lb-test-01540',
        identity: null,
        kind: '',
        location: 'southcentralus',
        managedBy: '',
        name: 'ericmai-lb-test-01540',
        plan: null,
        properties: {
          dnsSettings: {
            appliedDnsServers: [],
            dnsServers: [],
            internalDomainNameSuffix:
              'zg5ytky0r05ezb2ck4xnqy2dbc.jx.internal.cloudapp.net',
          },
          enableAcceleratedNetworking: false,
          enableIPForwarding: false,
          hostedWorkloads: [],
          ipConfigurations: [
            {
              etag: 'W/"70e7f8a9-dd51-4852-a342-bdea84d1a6c4"',
              id:
                '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/networkInterfaces/ericmai-lb-test-01540/ipConfigurations/ipconfig1',
              name: 'ipconfig1',
              properties: {
                loadBalancerBackendAddressPools: [
                  {
                    id:
                      '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/backendAddressPools/avail-set',
                    resourceGroup: 'ericmai-vnet-loadbalancer',
                  },
                ],
                primary: true,
                privateIPAddress: '172.16.0.6',
                privateIPAddressVersion: 'IPv4',
                privateIPAllocationMethod: 'Dynamic',
                provisioningState: 'Succeeded',
                subnet: {
                  id:
                    '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/virtualNetworks/ericmai-vnet-loadbalancer-vnet/subnets/default',
                  resourceGroup: 'ericmai-vnet-loadbalancer',
                },
              },
              resourceGroup: 'ericmai-vnet-loadbalancer',
              type: 'Microsoft.Network/networkInterfaces/ipConfigurations',
            },
          ],
          macAddress: '00-0D-3A-EE-42-BE',
          networkSecurityGroup: {
            id:
              '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/networkSecurityGroups/ericmai-lb-test-01-nsg',
            resourceGroup: 'ericmai-vnet-loadbalancer',
          },
          nicType: 'Standard',
          primary: true,
          provisioningState: 'Succeeded',
          resourceGuid: '2869a30d-642d-480d-beba-833537126444',
          tapConfigurations: [],
          virtualMachine: {
            id:
              '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Compute/virtualMachines/ericmai-lb-test-01',
            resourceGroup: 'ericmai-vnet-loadbalancer',
          },
        },
        resourceGroup: 'ericmai-vnet-loadbalancer',
        sku: null,
        subscriptionId: 'b8dc8f25-7e85-4e7e-bde2-3d621b696e9b',
        tags: null,
        tenantId: '72f988bf-86f1-41af-91ab-2d7cd011db47',
        type: 'microsoft.network/networkinterfaces',
        zones: null,
      },
      {
        extendedLocation: null,
        id:
          '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/networkSecurityGroups/basicNsgericmai-vnet-loadbalancer-vnet-nic01',
        identity: null,
        kind: '',
        location: 'southcentralus',
        managedBy: '',
        name: 'basicNsgericmai-vnet-loadbalancer-vnet-nic01',
        plan: null,
        properties: {
          defaultSecurityRules: [
            {
              etag: 'W/"1525453f-e8a8-48da-837a-936a37455f4e"',
              id:
                '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/networkSecurityGroups/basicNsgericmai-vnet-loadbalancer-vnet-nic01/defaultSecurityRules/AllowVnetInBound',
              name: 'AllowVnetInBound',
              properties: {
                access: 'Allow',
                description: 'Allow inbound traffic from all VMs in VNET',
                destinationAddressPrefix: 'VirtualNetwork',
                destinationAddressPrefixes: [],
                destinationPortRange: '*',
                destinationPortRanges: [],
                direction: 'Inbound',
                priority: 65000,
                protocol: '*',
                provisioningState: 'Succeeded',
                sourceAddressPrefix: 'VirtualNetwork',
                sourceAddressPrefixes: [],
                sourcePortRange: '*',
                sourcePortRanges: [],
              },
              resourceGroup: 'ericmai-vnet-loadbalancer',
              type:
                'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
            },
            {
              etag: 'W/"1525453f-e8a8-48da-837a-936a37455f4e"',
              id:
                '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/networkSecurityGroups/basicNsgericmai-vnet-loadbalancer-vnet-nic01/defaultSecurityRules/AllowAzureLoadBalancerInBound',
              name: 'AllowAzureLoadBalancerInBound',
              properties: {
                access: 'Allow',
                description: 'Allow inbound traffic from azure load balancer',
                destinationAddressPrefix: '*',
                destinationAddressPrefixes: [],
                destinationPortRange: '*',
                destinationPortRanges: [],
                direction: 'Inbound',
                priority: 65001,
                protocol: '*',
                provisioningState: 'Succeeded',
                sourceAddressPrefix: 'AzureLoadBalancer',
                sourceAddressPrefixes: [],
                sourcePortRange: '*',
                sourcePortRanges: [],
              },
              resourceGroup: 'ericmai-vnet-loadbalancer',
              type:
                'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
            },
            {
              etag: 'W/"1525453f-e8a8-48da-837a-936a37455f4e"',
              id:
                '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/networkSecurityGroups/basicNsgericmai-vnet-loadbalancer-vnet-nic01/defaultSecurityRules/DenyAllInBound',
              name: 'DenyAllInBound',
              properties: {
                access: 'Deny',
                description: 'Deny all inbound traffic',
                destinationAddressPrefix: '*',
                destinationAddressPrefixes: [],
                destinationPortRange: '*',
                destinationPortRanges: [],
                direction: 'Inbound',
                priority: 65500,
                protocol: '*',
                provisioningState: 'Succeeded',
                sourceAddressPrefix: '*',
                sourceAddressPrefixes: [],
                sourcePortRange: '*',
                sourcePortRanges: [],
              },
              resourceGroup: 'ericmai-vnet-loadbalancer',
              type:
                'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
            },
            {
              etag: 'W/"1525453f-e8a8-48da-837a-936a37455f4e"',
              id:
                '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/networkSecurityGroups/basicNsgericmai-vnet-loadbalancer-vnet-nic01/defaultSecurityRules/AllowVnetOutBound',
              name: 'AllowVnetOutBound',
              properties: {
                access: 'Allow',
                description:
                  'Allow outbound traffic from all VMs to all VMs in VNET',
                destinationAddressPrefix: 'VirtualNetwork',
                destinationAddressPrefixes: [],
                destinationPortRange: '*',
                destinationPortRanges: [],
                direction: 'Outbound',
                priority: 65000,
                protocol: '*',
                provisioningState: 'Succeeded',
                sourceAddressPrefix: 'VirtualNetwork',
                sourceAddressPrefixes: [],
                sourcePortRange: '*',
                sourcePortRanges: [],
              },
              resourceGroup: 'ericmai-vnet-loadbalancer',
              type:
                'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
            },
            {
              etag: 'W/"1525453f-e8a8-48da-837a-936a37455f4e"',
              id:
                '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/networkSecurityGroups/basicNsgericmai-vnet-loadbalancer-vnet-nic01/defaultSecurityRules/AllowInternetOutBound',
              name: 'AllowInternetOutBound',
              properties: {
                access: 'Allow',
                description: 'Allow outbound traffic from all VMs to Internet',
                destinationAddressPrefix: 'Internet',
                destinationAddressPrefixes: [],
                destinationPortRange: '*',
                destinationPortRanges: [],
                direction: 'Outbound',
                priority: 65001,
                protocol: '*',
                provisioningState: 'Succeeded',
                sourceAddressPrefix: '*',
                sourceAddressPrefixes: [],
                sourcePortRange: '*',
                sourcePortRanges: [],
              },
              resourceGroup: 'ericmai-vnet-loadbalancer',
              type:
                'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
            },
            {
              etag: 'W/"1525453f-e8a8-48da-837a-936a37455f4e"',
              id:
                '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/networkSecurityGroups/basicNsgericmai-vnet-loadbalancer-vnet-nic01/defaultSecurityRules/DenyAllOutBound',
              name: 'DenyAllOutBound',
              properties: {
                access: 'Deny',
                description: 'Deny all outbound traffic',
                destinationAddressPrefix: '*',
                destinationAddressPrefixes: [],
                destinationPortRange: '*',
                destinationPortRanges: [],
                direction: 'Outbound',
                priority: 65500,
                protocol: '*',
                provisioningState: 'Succeeded',
                sourceAddressPrefix: '*',
                sourceAddressPrefixes: [],
                sourcePortRange: '*',
                sourcePortRanges: [],
              },
              resourceGroup: 'ericmai-vnet-loadbalancer',
              type:
                'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
            },
          ],
          networkInterfaces: [
            {
              id:
                '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Compute/virtualMachineScaleSets/ericmai/virtualMachines/0/networkInterfaces/ericmai-vnet-loadbalancer-vnet-nic01',
              resourceGroup: 'ericmai-vnet-loadbalancer',
            },
            {
              id:
                '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Compute/virtualMachineScaleSets/ericmai-linux/virtualMachines/0/networkInterfaces/ericmai-vnet-loadbalancer-vnet-nic01',
              resourceGroup: 'ericmai-vnet-loadbalancer',
            },
          ],
          provisioningState: 'Succeeded',
          resourceGuid: '32db184c-06dc-4b14-a3db-1363595f9cc7',
          securityRules: [],
        },
        resourceGroup: 'ericmai-vnet-loadbalancer',
        sku: null,
        subscriptionId: 'b8dc8f25-7e85-4e7e-bde2-3d621b696e9b',
        tags: null,
        tenantId: '72f988bf-86f1-41af-91ab-2d7cd011db47',
        type: 'microsoft.network/networksecuritygroups',
        zones: null,
      },
      {
        extendedLocation: null,
        id:
          '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/networkSecurityGroups/ericmai-lb-test-01-nsg',
        identity: null,
        kind: '',
        location: 'southcentralus',
        managedBy: '',
        name: 'ericmai-lb-test-01-nsg',
        plan: null,
        properties: {
          defaultSecurityRules: [
            {
              etag: 'W/"473cfea8-5ee1-4051-9f9f-ccdc009cc541"',
              id:
                '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/networkSecurityGroups/ericmai-lb-test-01-nsg/defaultSecurityRules/AllowVnetInBound',
              name: 'AllowVnetInBound',
              properties: {
                access: 'Allow',
                description: 'Allow inbound traffic from all VMs in VNET',
                destinationAddressPrefix: 'VirtualNetwork',
                destinationAddressPrefixes: [],
                destinationPortRange: '*',
                destinationPortRanges: [],
                direction: 'Inbound',
                priority: 65000,
                protocol: '*',
                provisioningState: 'Succeeded',
                sourceAddressPrefix: 'VirtualNetwork',
                sourceAddressPrefixes: [],
                sourcePortRange: '*',
                sourcePortRanges: [],
              },
              resourceGroup: 'ericmai-vnet-loadbalancer',
              type:
                'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
            },
            {
              etag: 'W/"473cfea8-5ee1-4051-9f9f-ccdc009cc541"',
              id:
                '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/networkSecurityGroups/ericmai-lb-test-01-nsg/defaultSecurityRules/AllowAzureLoadBalancerInBound',
              name: 'AllowAzureLoadBalancerInBound',
              properties: {
                access: 'Allow',
                description: 'Allow inbound traffic from azure load balancer',
                destinationAddressPrefix: '*',
                destinationAddressPrefixes: [],
                destinationPortRange: '*',
                destinationPortRanges: [],
                direction: 'Inbound',
                priority: 65001,
                protocol: '*',
                provisioningState: 'Succeeded',
                sourceAddressPrefix: 'AzureLoadBalancer',
                sourceAddressPrefixes: [],
                sourcePortRange: '*',
                sourcePortRanges: [],
              },
              resourceGroup: 'ericmai-vnet-loadbalancer',
              type:
                'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
            },
            {
              etag: 'W/"473cfea8-5ee1-4051-9f9f-ccdc009cc541"',
              id:
                '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/networkSecurityGroups/ericmai-lb-test-01-nsg/defaultSecurityRules/DenyAllInBound',
              name: 'DenyAllInBound',
              properties: {
                access: 'Deny',
                description: 'Deny all inbound traffic',
                destinationAddressPrefix: '*',
                destinationAddressPrefixes: [],
                destinationPortRange: '*',
                destinationPortRanges: [],
                direction: 'Inbound',
                priority: 65500,
                protocol: '*',
                provisioningState: 'Succeeded',
                sourceAddressPrefix: '*',
                sourceAddressPrefixes: [],
                sourcePortRange: '*',
                sourcePortRanges: [],
              },
              resourceGroup: 'ericmai-vnet-loadbalancer',
              type:
                'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
            },
            {
              etag: 'W/"473cfea8-5ee1-4051-9f9f-ccdc009cc541"',
              id:
                '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/networkSecurityGroups/ericmai-lb-test-01-nsg/defaultSecurityRules/AllowVnetOutBound',
              name: 'AllowVnetOutBound',
              properties: {
                access: 'Allow',
                description:
                  'Allow outbound traffic from all VMs to all VMs in VNET',
                destinationAddressPrefix: 'VirtualNetwork',
                destinationAddressPrefixes: [],
                destinationPortRange: '*',
                destinationPortRanges: [],
                direction: 'Outbound',
                priority: 65000,
                protocol: '*',
                provisioningState: 'Succeeded',
                sourceAddressPrefix: 'VirtualNetwork',
                sourceAddressPrefixes: [],
                sourcePortRange: '*',
                sourcePortRanges: [],
              },
              resourceGroup: 'ericmai-vnet-loadbalancer',
              type:
                'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
            },
            {
              etag: 'W/"473cfea8-5ee1-4051-9f9f-ccdc009cc541"',
              id:
                '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/networkSecurityGroups/ericmai-lb-test-01-nsg/defaultSecurityRules/AllowInternetOutBound',
              name: 'AllowInternetOutBound',
              properties: {
                access: 'Allow',
                description: 'Allow outbound traffic from all VMs to Internet',
                destinationAddressPrefix: 'Internet',
                destinationAddressPrefixes: [],
                destinationPortRange: '*',
                destinationPortRanges: [],
                direction: 'Outbound',
                priority: 65001,
                protocol: '*',
                provisioningState: 'Succeeded',
                sourceAddressPrefix: '*',
                sourceAddressPrefixes: [],
                sourcePortRange: '*',
                sourcePortRanges: [],
              },
              resourceGroup: 'ericmai-vnet-loadbalancer',
              type:
                'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
            },
            {
              etag: 'W/"473cfea8-5ee1-4051-9f9f-ccdc009cc541"',
              id:
                '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/networkSecurityGroups/ericmai-lb-test-01-nsg/defaultSecurityRules/DenyAllOutBound',
              name: 'DenyAllOutBound',
              properties: {
                access: 'Deny',
                description: 'Deny all outbound traffic',
                destinationAddressPrefix: '*',
                destinationAddressPrefixes: [],
                destinationPortRange: '*',
                destinationPortRanges: [],
                direction: 'Outbound',
                priority: 65500,
                protocol: '*',
                provisioningState: 'Succeeded',
                sourceAddressPrefix: '*',
                sourceAddressPrefixes: [],
                sourcePortRange: '*',
                sourcePortRanges: [],
              },
              resourceGroup: 'ericmai-vnet-loadbalancer',
              type:
                'Microsoft.Network/networkSecurityGroups/defaultSecurityRules',
            },
          ],
          networkInterfaces: [
            {
              id:
                '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/networkInterfaces/ericmai-lb-test-01540',
              resourceGroup: 'ericmai-vnet-loadbalancer',
            },
          ],
          provisioningState: 'Succeeded',
          resourceGuid: '77470824-26d6-43ef-8e00-be43f1439fac',
          securityRules: [],
        },
        resourceGroup: 'ericmai-vnet-loadbalancer',
        sku: null,
        subscriptionId: 'b8dc8f25-7e85-4e7e-bde2-3d621b696e9b',
        tags: null,
        tenantId: '72f988bf-86f1-41af-91ab-2d7cd011db47',
        type: 'microsoft.network/networksecuritygroups',
        zones: null,
      },
      {
        extendedLocation: null,
        id:
          '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/publicIPAddresses/ericmai-ip',
        identity: null,
        kind: '',
        location: 'southcentralus',
        managedBy: '',
        name: 'ericmai-ip',
        plan: null,
        properties: {
          idleTimeoutInMinutes: 4,
          ipAddress: '13.66.93.198',
          ipConfiguration: {
            id:
              '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/loadBalancers/ericmai-lb/frontendIPConfigurations/LoadBalancerFrontEnd',
            resourceGroup: 'ericmai-vnet-loadbalancer',
          },
          ipTags: [],
          provisioningState: 'Succeeded',
          publicIPAddressVersion: 'IPv4',
          publicIPAllocationMethod: 'Static',
          resourceGuid: '7736dd00-acaf-4ef0-9f2a-d0bf00b1a4ca',
        },
        resourceGroup: 'ericmai-vnet-loadbalancer',
        sku: {
          name: 'Standard',
          tier: 'Regional',
        },
        subscriptionId: 'b8dc8f25-7e85-4e7e-bde2-3d621b696e9b',
        tags: null,
        tenantId: '72f988bf-86f1-41af-91ab-2d7cd011db47',
        type: 'microsoft.network/publicipaddresses',
        zones: null,
      },
      {
        extendedLocation: null,
        id:
          '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/virtualNetworks/ericmai-vnet-loadbalancer-vnet',
        identity: null,
        kind: '',
        location: 'southcentralus',
        managedBy: '',
        name: 'ericmai-vnet-loadbalancer-vnet',
        plan: null,
        properties: {
          addressSpace: {
            addressPrefixes: ['172.16.0.0/24'],
          },
          enableDdosProtection: false,
          provisioningState: 'Succeeded',
          resourceGuid: 'ab89bfc9-8e1a-4cbe-8782-57aed863830a',
          subnets: [
            {
              etag: 'W/"0379ec62-ad1e-4672-91e3-05e85f7bd69b"',
              id:
                '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Network/virtualNetworks/ericmai-vnet-loadbalancer-vnet/subnets/default',
              name: 'default',
              properties: {
                addressPrefix: '172.16.0.0/24',
                delegations: [],
                ipConfigurations: [
                  {
                    id:
                      '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Compute/virtualMachineScaleSets/ericmai/virtualMachines/0/networkInterfaces/ericmai-vnet-loadbalancer-vnet-nic01/ipConfigurations/ericmai-vnet-loadbalancer-vnet-nic01-defaultIpConfiguration',
                    resourceGroup: 'ericmai-vnet-loadbalancer',
                  },
                  {
                    id:
                      '/subscriptions/b8dc8f25-7e85-4e7e-bde2-3d621b696e9b/resourceGroups/ericmai-vnet-loadbalancer/providers/Microsoft.Compute/virtualMachineScaleSets/ericmai-linux/virtualMachines/0/networkInterfaces/ericmai-vnet-loadbalancer-vnet-nic01/ipConfigurations/ericmai-vnet-loadbalancer-vnet-nic01-defaultIpConfiguration',
                    resourceGroup: 'ericmai-vnet-loadbalancer',
                  },
                ],
                privateEndpointNetworkPolicies: 'Enabled',
                privateLinkServiceNetworkPolicies: 'Enabled',
                provisioningState: 'Succeeded',
              },
              resourceGroup: 'ericmai-vnet-loadbalancer',
              type: 'Microsoft.Network/virtualNetworks/subnets',
            },
          ],
          virtualNetworkPeerings: [],
        },
        resourceGroup: 'ericmai-vnet-loadbalancer',
        sku: null,
        subscriptionId: 'b8dc8f25-7e85-4e7e-bde2-3d621b696e9b',
        tags: null,
        tenantId: '72f988bf-86f1-41af-91ab-2d7cd011db47',
        type: 'microsoft.network/virtualnetworks',
        zones: null,
      },
    ];
    return graph as AzureResourceGraph;
  }
}
