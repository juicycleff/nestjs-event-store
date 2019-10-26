import { GqlModuleOptions } from '@nestjs/graphql';
import { ResolversExplorerService } from '@nestjs/graphql/dist/services/resolvers-explorer.service';
import { ScalarsExplorerService } from '@nestjs/graphql/dist/services/scalars-explorer.service';
import { ReferencesExplorerService } from './services';
export declare class GraphqlDistributedFactory {
    private readonly resolversExplorerService;
    private readonly scalarsExplorerService;
    private readonly referencesExplorerService;
    constructor(resolversExplorerService: ResolversExplorerService, scalarsExplorerService: ScalarsExplorerService, referencesExplorerService: ReferencesExplorerService);
    mergeOptions(options?: GqlModuleOptions): Promise<GqlModuleOptions>;
    private extendResolvers;
}
