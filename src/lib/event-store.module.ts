import { DynamicModule, Module } from '@nestjs/common';
import { EventStore } from './event-store';
import {
  EventStoreModuleOptions,
  EventStoreModuleAsyncOptions,
  EventStoreOptionConfig,
  ProvidersConstants
} from './contract';
import { EventStoreCoreModule } from './event-store-core.module';
import { eventStoreProviders } from './providers';
import { ExplorerService } from '@nestjs/cqrs/dist/services/explorer.service';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [CqrsModule],
  providers: [
    ...eventStoreProviders,
    {
      provide: 'EVENT_STORE_CONFIG',
      useValue: 'EVENT_STORE_CONFIG_USE_ENV',
    },
  ],
  exports: [
    ...eventStoreProviders,
    {
      provide: 'EVENT_STORE_CONFIG',
      useValue: 'EVENT_STORE_CONFIG_USE_ENV',
    },
  ],
})
export class EventStoreModule {

  static register(option: EventStoreModuleOptions): DynamicModule {
    return {
      module: EventStoreCoreModule,
      imports: [EventStoreCoreModule.register(option)],
    };
  }

  static registerAsync(option: EventStoreModuleAsyncOptions): DynamicModule {
    return {
      module: EventStoreCoreModule,
      imports: [EventStoreCoreModule.registerAsync(option)],
    };
  }

  static forFeature(config: EventStoreOptionConfig): DynamicModule {

    if (config === undefined || config === null) {
      throw new Error('Config missing');
    }

    return {
      module: EventStoreCoreModule,
      providers: [
        ExplorerService,
        {
          provide: ProvidersConstants.EVENT_STORE_STREAM_CONFIG_PROVIDER,
          useValue: {
            ...config,
          },
        },
        EventStore,
      ],
      exports: [
        EventStore,
        ExplorerService,
      ],
    };
  }
}
