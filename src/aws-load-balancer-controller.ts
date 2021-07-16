import * as cdk8s from 'cdk8s';
import { Construct } from 'constructs';


export interface AwsLoadBalancerControllerOptions {
  /**
   * Kubernetes Cluster Name for aws-load-balancer-controller.
   * @default - None
   */
  readonly clusterName: string ;

  /**
   * service account for aws-load-balancer-controller.
   *
   * @default - true
   */
  readonly createServiceAccount?: boolean;

  /**
   * Namespace for aws-load-balancer-controller.
   * @default - default
   */
  readonly namespace?: string;

  /**
   * Helm Chart Version for aws-load-balancer-controller.
   * @default - latest Helm Chart version.
   */
  readonly chartVersion?: string;
}
/**
 * Generate aws-load-balancer-controller config yaml.
 * see https://github.com/kubernetes-sigs/aws-aws-load-balancer-controller/blob/master/docs/install/v2_0_0_full.yaml
*/
export class AwsLoadBalancerController extends Construct {
  /**
   * Service Account Name for aws-load-balancer-controller.
   */
  public readonly serviceAccountName: string;
  /**
   * Kubernetes Cluster Name for aws-load-balancer-controller.
   */
  public readonly clusterName: string;
  /**
   * Kubernetes Deployment Name for aws-load-balancer-controller.
   */
  public readonly deploymentName: string;
  /**
   * Namespace for aws-load-balancer-controller.
   * @default - default
   */
  public readonly namespace: string;
  /**
   * Helm Chart Version for aws-load-balancer-controller.
   * @default - latest Helm Chart version.
   */
  public readonly chartVersion: string;
  constructor(scope: Construct, id: string, options: AwsLoadBalancerControllerOptions) {
    super(scope, id);
    this.serviceAccountName = 'aws-load-balancer-controller';
    this.deploymentName = 'aws-load-balancer-controller';
    this.clusterName = options.clusterName;
    this.namespace = options.namespace ?? 'default';
    this.chartVersion = options.chartVersion ?? '';
    // ingressclassparams elbv2 k8s aws CRD.
    new cdk8s.ApiObject(this, 'aws-load-balancer-controller-ingclassparams-crd', {
      apiVersion: 'apiextensions.k8s.io/v1',
      kind: 'CustomResourceDefinition',
      metadata: {
        annotations: {
          'controller-gen.kubebuilder.io/version': 'v0.5.0',
        },
        creationTimestamp: null,
        name: 'ingressclassparams.elbv2.k8s.aws',
      },
      spec: {
        group: 'elbv2.k8s.aws',
        names: {
          kind: 'IngressClassParams',
          listKind: 'IngressClassParamsList',
          plural: 'ingressclassparams',
          singular: 'ingressclassparams',
        },
        scope: 'Cluster',
        versions: [
          {
            additionalPrinterColumns: [
              {
                description: 'The Ingress Group name',
                jsonPath: '.spec.group.name',
                name: 'GROUP-NAME',
                type: 'string',
              },
              {
                description: 'The AWS Load Balancer scheme',
                jsonPath: '.spec.scheme',
                name: 'SCHEME',
                type: 'string',
              },
              {
                description: 'The AWS Load Balancer ipAddressType',
                jsonPath: '.spec.ipAddressType',
                name: 'IP-ADDRESS-TYPE',
                type: 'string',
              },
              {
                jsonPath: '.metadata.creationTimestamp',
                name: 'AGE',
                type: 'date',
              },
            ],
            name: 'v1beta1',
            schema: {
              openAPIV3Schema: {
                description: 'IngressClassParams is the Schema for the IngressClassParams API',
                properties: {
                  apiVersion: {
                    description: 'APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources',
                    type: 'string',
                  },
                  kind: {
                    description: 'Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds',
                    type: 'string',
                  },
                  metadata: {
                    type: 'object',
                  },
                  spec: {
                    description: 'IngressClassParamsSpec defines the desired state of IngressClassParams',
                    properties: {
                      group: {
                        description: 'Group defines the IngressGroup for all Ingresses that belong to IngressClass with this IngressClassParams.',
                        properties: {
                          name: {
                            description: 'Name is the name of IngressGroup.',
                            type: 'string',
                          },
                        },
                        required: [
                          'name',
                        ],
                        type: 'object',
                      },
                      ipAddressType: {
                        description: 'IPAddressType defines the ip address type for all Ingresses that belong to IngressClass with this IngressClassParams.',
                        enum: [
                          'ipv4',
                          'dualstack',
                        ],
                        type: 'string',
                      },
                      namespaceSelector: {
                        description: 'NamespaceSelector restrict the namespaces of Ingresses that are allowed to specify the IngressClass with this IngressClassParams. * if absent or present but empty, it selects all namespaces.',
                        properties: {
                          matchExpressions: {
                            description: 'matchExpressions is a list of label selector requirements. The requirements are ANDed.',
                            items: {
                              description: 'A label selector requirement is a selector that contains values, a key, and an operator that relates the key and values.',
                              properties: {
                                key: {
                                  description: 'key is the label key that the selector applies to.',
                                  type: 'string',
                                },
                                operator: {
                                  description: "operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist.",
                                  type: 'string',
                                },
                                values: {
                                  description: 'values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch.',
                                  items: {
                                    type: 'string',
                                  },
                                  type: 'array',
                                },
                              },
                              required: [
                                'key',
                                'operator',
                              ],
                              type: 'object',
                            },
                            type: 'array',
                          },
                          matchLabels: {
                            additionalProperties: {
                              type: 'string',
                            },
                            description: 'matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.',
                            type: 'object',
                          },
                        },
                        type: 'object',
                      },
                      scheme: {
                        description: 'Scheme defines the scheme for all Ingresses that belong to IngressClass with this IngressClassParams.',
                        enum: [
                          'internal',
                          'internet-facing',
                        ],
                        type: 'string',
                      },
                      tags: {
                        description: 'Tags defines list of Tags on AWS resources provisioned for Ingresses that belong to IngressClass with this IngressClassParams.',
                        items: {
                          description: 'Tag defines a AWS Tag on resources.',
                          properties: {
                            key: {
                              description: 'The key of the tag.',
                              type: 'string',
                            },
                            value: {
                              description: 'The value of the tag.',
                              type: 'string',
                            },
                          },
                          required: [
                            'key',
                            'value',
                          ],
                          type: 'object',
                        },
                        type: 'array',
                      },
                    },
                    type: 'object',
                  },
                },
                type: 'object',
              },
            },
            served: true,
            storage: true,
            subresources: {},
          },
        ],
      },
    });

    // targetgroupbindings  elbv2 k8s aws CRD.
    new cdk8s.ApiObject(this, 'aws-load-balancer-controller-tgbinding-crd', {
      apiVersion: 'apiextensions.k8s.io/v1',
      kind: 'CustomResourceDefinition',
      metadata: {
        annotations: {
          'controller-gen.kubebuilder.io/version': 'v0.5.0',
        },
        creationTimestamp: null,
        name: 'targetgroupbindings.elbv2.k8s.aws',
      },
      spec: {
        group: 'elbv2.k8s.aws',
        names: {
          kind: 'TargetGroupBinding',
          listKind: 'TargetGroupBindingList',
          plural: 'targetgroupbindings',
          singular: 'targetgroupbinding',
        },
        scope: 'Namespaced',
        versions: [
          {
            additionalPrinterColumns: [
              {
                description: "The Kubernetes Service's name",
                jsonPath: '.spec.serviceRef.name',
                name: 'SERVICE-NAME',
                type: 'string',
              },
              {
                description: "The Kubernetes Service's port",
                jsonPath: '.spec.serviceRef.port',
                name: 'SERVICE-PORT',
                type: 'string',
              },
              {
                description: "The AWS TargetGroup's TargetType",
                jsonPath: '.spec.targetType',
                name: 'TARGET-TYPE',
                type: 'string',
              },
              {
                description: "The AWS TargetGroup's Amazon Resource Name",
                jsonPath: '.spec.targetGroupARN',
                name: 'ARN',
                priority: 1,
                type: 'string',
              },
              {
                jsonPath: '.metadata.creationTimestamp',
                name: 'AGE',
                type: 'date',
              },
            ],
            name: 'v1alpha1',
            schema: {
              openAPIV3Schema: {
                description: 'TargetGroupBinding is the Schema for the TargetGroupBinding API',
                properties: {
                  apiVersion: {
                    description: 'APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources',
                    type: 'string',
                  },
                  kind: {
                    description: 'Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds',
                    type: 'string',
                  },
                  metadata: {
                    type: 'object',
                  },
                  spec: {
                    description: 'TargetGroupBindingSpec defines the desired state of TargetGroupBinding',
                    properties: {
                      networking: {
                        description: 'networking provides the networking setup for ELBV2 LoadBalancer to access targets in TargetGroup.',
                        properties: {
                          ingress: {
                            description: 'List of ingress rules to allow ELBV2 LoadBalancer to access targets in TargetGroup.',
                            items: {
                              properties: {
                                from: {
                                  description: 'List of peers which should be able to access the targets in TargetGroup. At least one NetworkingPeer should be specified.',
                                  items: {
                                    description: 'NetworkingPeer defines the source/destination peer for networking rules.',
                                    properties: {
                                      ipBlock: {
                                        description: 'IPBlock defines an IPBlock peer. If specified, none of the other fields can be set.',
                                        properties: {
                                          cidr: {
                                            description: 'CIDR is the network CIDR. Both IPV4 or IPV6 CIDR are accepted.',
                                            type: 'string',
                                          },
                                        },
                                        required: [
                                          'cidr',
                                        ],
                                        type: 'object',
                                      },
                                      securityGroup: {
                                        description: 'SecurityGroup defines a SecurityGroup peer. If specified, none of the other fields can be set.',
                                        properties: {
                                          groupID: {
                                            description: 'GroupID is the EC2 SecurityGroupID.',
                                            type: 'string',
                                          },
                                        },
                                        required: [
                                          'groupID',
                                        ],
                                        type: 'object',
                                      },
                                    },
                                    type: 'object',
                                  },
                                  type: 'array',
                                },
                                ports: {
                                  description: 'List of ports which should be made accessible on the targets in TargetGroup. If ports is empty or unspecified, it defaults to all ports with TCP.',
                                  items: {
                                    properties: {
                                      port: {
                                        'anyOf': [
                                          {
                                            type: 'integer',
                                          },
                                          {
                                            type: 'string',
                                          },
                                        ],
                                        'description': 'The port which traffic must match. When NodePort endpoints(instance TargetType) is used, this must be a numerical port. When Port endpoints(ip TargetType) is used, this can be either numerical or named port on pods. if port is unspecified, it defaults to all ports.',
                                        'x-kubernetes-int-or-string': true,
                                      },
                                      protocol: {
                                        description: 'The protocol which traffic must match. If protocol is unspecified, it defaults to TCP.',
                                        enum: [
                                          'TCP',
                                          'UDP',
                                        ],
                                        type: 'string',
                                      },
                                    },
                                    type: 'object',
                                  },
                                  type: 'array',
                                },
                              },
                              required: [
                                'from',
                                'ports',
                              ],
                              type: 'object',
                            },
                            type: 'array',
                          },
                        },
                        type: 'object',
                      },
                      serviceRef: {
                        description: 'serviceRef is a reference to a Kubernetes Service and ServicePort.',
                        properties: {
                          name: {
                            description: 'Name is the name of the Service.',
                            type: 'string',
                          },
                          port: {
                            'anyOf': [
                              {
                                type: 'integer',
                              },
                              {
                                type: 'string',
                              },
                            ],
                            'description': 'Port is the port of the ServicePort.',
                            'x-kubernetes-int-or-string': true,
                          },
                        },
                        required: [
                          'name',
                          'port',
                        ],
                        type: 'object',
                      },
                      targetGroupARN: {
                        description: 'targetGroupARN is the Amazon Resource Name (ARN) for the TargetGroup.',
                        type: 'string',
                      },
                      targetType: {
                        description: 'targetType is the TargetType of TargetGroup. If unspecified, it will be automatically inferred.',
                        enum: [
                          'instance',
                          'ip',
                        ],
                        type: 'string',
                      },
                    },
                    required: [
                      'serviceRef',
                      'targetGroupARN',
                    ],
                    type: 'object',
                  },
                  status: {
                    description: 'TargetGroupBindingStatus defines the observed state of TargetGroupBinding',
                    properties: {
                      observedGeneration: {
                        description: 'The generation observed by the TargetGroupBinding controller.',
                        format: 'int64',
                        type: 'integer',
                      },
                    },
                    type: 'object',
                  },
                },
                type: 'object',
              },
            },
            served: true,
            storage: false,
            subresources: {
              status: {},
            },
          },
          {
            additionalPrinterColumns: [
              {
                description: "The Kubernetes Service's name",
                jsonPath: '.spec.serviceRef.name',
                name: 'SERVICE-NAME',
                type: 'string',
              },
              {
                description: "The Kubernetes Service's port",
                jsonPath: '.spec.serviceRef.port',
                name: 'SERVICE-PORT',
                type: 'string',
              },
              {
                description: "The AWS TargetGroup's TargetType",
                jsonPath: '.spec.targetType',
                name: 'TARGET-TYPE',
                type: 'string',
              },
              {
                description: "The AWS TargetGroup's Amazon Resource Name",
                jsonPath: '.spec.targetGroupARN',
                name: 'ARN',
                priority: 1,
                type: 'string',
              },
              {
                jsonPath: '.metadata.creationTimestamp',
                name: 'AGE',
                type: 'date',
              },
            ],
            name: 'v1beta1',
            schema: {
              openAPIV3Schema: {
                description: 'TargetGroupBinding is the Schema for the TargetGroupBinding API',
                properties: {
                  apiVersion: {
                    description: 'APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources',
                    type: 'string',
                  },
                  kind: {
                    description: 'Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds',
                    type: 'string',
                  },
                  metadata: {
                    type: 'object',
                  },
                  spec: {
                    description: 'TargetGroupBindingSpec defines the desired state of TargetGroupBinding',
                    properties: {
                      networking: {
                        description: 'networking defines the networking rules to allow ELBV2 LoadBalancer to access targets in TargetGroup.',
                        properties: {
                          ingress: {
                            description: 'List of ingress rules to allow ELBV2 LoadBalancer to access targets in TargetGroup.',
                            items: {
                              description: "NetworkingIngressRule defines a particular set of traffic that is allowed to access TargetGroup's targets.",
                              properties: {
                                from: {
                                  description: 'List of peers which should be able to access the targets in TargetGroup. At least one NetworkingPeer should be specified.',
                                  items: {
                                    description: 'NetworkingPeer defines the source/destination peer for networking rules.',
                                    properties: {
                                      ipBlock: {
                                        description: 'IPBlock defines an IPBlock peer. If specified, none of the other fields can be set.',
                                        properties: {
                                          cidr: {
                                            description: 'CIDR is the network CIDR. Both IPV4 or IPV6 CIDR are accepted.',
                                            type: 'string',
                                          },
                                        },
                                        required: [
                                          'cidr',
                                        ],
                                        type: 'object',
                                      },
                                      securityGroup: {
                                        description: 'SecurityGroup defines a SecurityGroup peer. If specified, none of the other fields can be set.',
                                        properties: {
                                          groupID: {
                                            description: 'GroupID is the EC2 SecurityGroupID.',
                                            type: 'string',
                                          },
                                        },
                                        required: [
                                          'groupID',
                                        ],
                                        type: 'object',
                                      },
                                    },
                                    type: 'object',
                                  },
                                  type: 'array',
                                },
                                ports: {
                                  description: 'List of ports which should be made accessible on the targets in TargetGroup. If ports is empty or unspecified, it defaults to all ports with TCP.',
                                  items: {
                                    description: 'NetworkingPort defines the port and protocol for networking rules.',
                                    properties: {
                                      port: {
                                        'anyOf': [
                                          {
                                            type: 'integer',
                                          },
                                          {
                                            type: 'string',
                                          },
                                        ],
                                        'description': 'The port which traffic must match. When NodePort endpoints(instance TargetType) is used, this must be a numerical port. When Port endpoints(ip TargetType) is used, this can be either numerical or named port on pods. if port is unspecified, it defaults to all ports.',
                                        'x-kubernetes-int-or-string': true,
                                      },
                                      protocol: {
                                        description: 'The protocol which traffic must match. If protocol is unspecified, it defaults to TCP.',
                                        enum: [
                                          'TCP',
                                          'UDP',
                                        ],
                                        type: 'string',
                                      },
                                    },
                                    type: 'object',
                                  },
                                  type: 'array',
                                },
                              },
                              required: [
                                'from',
                                'ports',
                              ],
                              type: 'object',
                            },
                            type: 'array',
                          },
                        },
                        type: 'object',
                      },
                      nodeSelector: {
                        description: 'node selector for instance type target groups to only register certain nodes',
                        properties: {
                          matchExpressions: {
                            description: 'matchExpressions is a list of label selector requirements. The requirements are ANDed.',
                            items: {
                              description: 'A label selector requirement is a selector that contains values, a key, and an operator that relates the key and values.',
                              properties: {
                                key: {
                                  description: 'key is the label key that the selector applies to.',
                                  type: 'string',
                                },
                                operator: {
                                  description: "operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist.",
                                  type: 'string',
                                },
                                values: {
                                  description: 'values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch.',
                                  items: {
                                    type: 'string',
                                  },
                                  type: 'array',
                                },
                              },
                              required: [
                                'key',
                                'operator',
                              ],
                              type: 'object',
                            },
                            type: 'array',
                          },
                          matchLabels: {
                            additionalProperties: {
                              type: 'string',
                            },
                            description: 'matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.',
                            type: 'object',
                          },
                        },
                        type: 'object',
                      },
                      serviceRef: {
                        description: 'serviceRef is a reference to a Kubernetes Service and ServicePort.',
                        properties: {
                          name: {
                            description: 'Name is the name of the Service.',
                            type: 'string',
                          },
                          port: {
                            'anyOf': [
                              {
                                type: 'integer',
                              },
                              {
                                type: 'string',
                              },
                            ],
                            'description': 'Port is the port of the ServicePort.',
                            'x-kubernetes-int-or-string': true,
                          },
                        },
                        required: [
                          'name',
                          'port',
                        ],
                        type: 'object',
                      },
                      targetGroupARN: {
                        description: 'targetGroupARN is the Amazon Resource Name (ARN) for the TargetGroup.',
                        minLength: 1,
                        type: 'string',
                      },
                      targetType: {
                        description: 'targetType is the TargetType of TargetGroup. If unspecified, it will be automatically inferred.',
                        enum: [
                          'instance',
                          'ip',
                        ],
                        type: 'string',
                      },
                    },
                    required: [
                      'serviceRef',
                      'targetGroupARN',
                    ],
                    type: 'object',
                  },
                  status: {
                    description: 'TargetGroupBindingStatus defines the observed state of TargetGroupBinding',
                    properties: {
                      observedGeneration: {
                        description: 'The generation observed by the TargetGroupBinding controller.',
                        format: 'int64',
                        type: 'integer',
                      },
                    },
                    type: 'object',
                  },
                },
                type: 'object',
              },
            },
            served: true,
            storage: true,
            subresources: {
              status: {},
            },
          },
        ],
      },
    });
    new cdk8s.Helm(this, 'helmawsLoadBalancerController', {
      chart: 'eks/aws-load-balancer-controller',
      releaseName: 'aws-load-balancer-controller',
      helmFlags: ['--namespace', this.namespace, '--version', this.chartVersion],
      values: {
        clusterName: options.clusterName,
        serviceAccount: {
          create: options.createServiceAccount ?? true,
          name: this.serviceAccountName,
        },
      },
    });
  }
}