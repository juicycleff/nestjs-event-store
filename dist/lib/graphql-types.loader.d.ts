import { DocumentNode } from 'graphql';
export declare class GraphQLTypesLoader {
    mergeTypesByPaths(paths: string | string[]): Promise<DocumentNode>;
    getTypesFromPaths(paths: string | string[]): Promise<string[]>;
}
