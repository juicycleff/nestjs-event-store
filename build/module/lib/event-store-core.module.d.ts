import { DynamicModule } from '@nestjs/common';
import { EventStoreFeatureAsyncOptions, EventStoreModuleAsyncOptions, EventStoreModuleOptions, EventStoreOptionConfig } from './contract';
export declare class EventStoreCoreModule {
    static register(option: EventStoreModuleOptions): DynamicModule;
    static registerAsync(options: EventStoreModuleAsyncOptions): DynamicModule;
    static registerFeature(config: EventStoreOptionConfig): DynamicModule;
    static registerFeatureAsync(options: EventStoreFeatureAsyncOptions): DynamicModule;
    private static createAsyncProviders;
    private static createAsyncOptionsProvider;
    private static createFeatureAsyncProviders;
    private static createFeatureAsyncOptionsProvider;
}
