import { DynamicModule } from '@nestjs/common';
import { EventStoreModuleOptions, EventStoreModuleAsyncOptions, EventStoreOptionConfig, EventStoreFeatureAsyncOptions } from './contract';
export declare class EventStoreModule {
    static register(option: EventStoreModuleOptions): DynamicModule;
    static registerAsync(option: EventStoreModuleAsyncOptions): DynamicModule;
    static registerFeature(config: EventStoreOptionConfig): DynamicModule;
    static registerFeatureAsync(options: EventStoreFeatureAsyncOptions): DynamicModule;
}
