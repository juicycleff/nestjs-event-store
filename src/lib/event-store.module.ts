import { DynamicModule, Module } from '@nestjs/common';
import {
  EventStoreModuleOptions,
  EventStoreModuleAsyncOptions,
  EventStoreOptionConfig,
  EventStoreFeatureAsyncOptions
} from './contract';
import { EventStoreCoreModule } from './event-store-core.module';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [CqrsModule]
})
export class EventStoreModule {
  static register(option: EventStoreModuleOptions): DynamicModule {
    return {
      module: EventStoreModule,
      imports: [EventStoreCoreModule.register(option)]
    };
  }

  static registerAsync(option: EventStoreModuleAsyncOptions): DynamicModule {
    return {
      module: EventStoreModule,
      imports: [EventStoreCoreModule.registerAsync(option)]
    };
  }

  static registerFeature(config: EventStoreOptionConfig): DynamicModule {
    return {
      module: EventStoreModule,
      imports: [EventStoreCoreModule.registerFeature(config)]
    };
  }

  static registerFeatureAsync(
    options: EventStoreFeatureAsyncOptions
  ): DynamicModule {
    return {
      module: EventStoreModule,
      imports: [EventStoreCoreModule.registerFeatureAsync(options)]
    };
  }
}
