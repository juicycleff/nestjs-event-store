import { DynamicModule, OnModuleInit } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { GqlModuleAsyncOptions, GqlModuleOptions, GraphQLFactory } from '@nestjs/graphql';
import { GraphqlDistributedFactory } from './graphql-distributed.factory';
import { GraphQLTypesLoader } from './graphql-types.loader';
export declare class GraphqlDistributedModule implements OnModuleInit {
    private readonly httpAdapterHost;
    private readonly options;
    private readonly graphqlFactory;
    private readonly graphqlDistributedFactory;
    private readonly graphqlTypesLoader;
    static forRoot(options?: GqlModuleOptions): DynamicModule;
    static forRootAsync(options: GqlModuleAsyncOptions): DynamicModule;
    private static createAsyncProviders;
    private static createAsyncOptionsProvider;
    private apolloServer;
    constructor(httpAdapterHost: HttpAdapterHost, options: GqlModuleOptions, graphqlFactory: GraphQLFactory, graphqlDistributedFactory: GraphqlDistributedFactory, graphqlTypesLoader: GraphQLTypesLoader);
    onModuleInit(): Promise<void>;
}
