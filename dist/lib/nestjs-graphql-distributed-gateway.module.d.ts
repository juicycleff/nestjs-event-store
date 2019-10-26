import { DynamicModule, OnModuleInit } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { IDistributedGatewayOptions } from './interfaces';
export declare class GraphqlDistributedGatewayModule implements OnModuleInit {
    private readonly httpAdapterHost;
    private readonly options;
    static forRoot(options: IDistributedGatewayOptions): DynamicModule;
    private apolloServer;
    constructor(httpAdapterHost: HttpAdapterHost, options: IDistributedGatewayOptions);
    onModuleInit(): Promise<void>;
}
