import { ModulesContainer } from '@nestjs/core';
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { GqlModuleOptions } from '@nestjs/graphql';
import { BaseExplorerService } from '@nestjs/graphql/dist/services/base-explorer.service';
export declare class ReferencesExplorerService extends BaseExplorerService {
    private readonly modulesContainer;
    private readonly metadataScanner;
    private readonly externalContextCreator;
    private readonly gqlOptions;
    private readonly gqlParamsFactory;
    constructor(modulesContainer: ModulesContainer, metadataScanner: MetadataScanner, externalContextCreator: ExternalContextCreator, gqlOptions: GqlModuleOptions);
    explore(): any;
    private predicate;
    private filterReferences;
    private createContextCallback;
}
