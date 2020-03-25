import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { EventStoreOptionConfig } from './contract/event-store-option.config';
import { ProvidersConstants } from './contract/nestjs-event-store.constant';
import { EventStore } from './event-store';
import {
  EventStoreModuleOptions,
  EventStoreModuleAsyncOptions,
  EventStoreOptionsFactory
} from './contract/event-store-connect-config.interface';
import { NEST_EVENTSTORE_OPTION } from './nest-eventstore.constants';
import { NestjsEventStoreCoreModule } from './nestjs-event-store-core.module';
import { eventStoreProviders } from './providers/nestjs-event-store.provider';
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
export class NestjsEventStoreModule {

  static forRoot(option: EventStoreModuleOptions): DynamicModule {
    return {
      module: NestjsEventStoreCoreModule,
      imports: [NestjsEventStoreCoreModule.forRoot(option)],
    };
  }

  static forRootAsync(option: EventStoreModuleAsyncOptions): DynamicModule {
    return {
      module: NestjsEventStoreCoreModule,
      imports: [NestjsEventStoreCoreModule.forRootAsync(option)],
    };
  }

  static forFeature(config: EventStoreOptionConfig): DynamicModule {

    if (config === undefined || config === null) {
      throw new Error('Config missing');
    }

    return {
      module: NestjsEventStoreCoreModule,
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


  private static createAsyncProviders(
    options: EventStoreModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<EventStoreOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: EventStoreModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: NEST_EVENTSTORE_OPTION,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    const inject = [
      (options.useClass || options.useExisting) as Type<EventStoreOptionsFactory>,
    ];
    return {
      provide: NEST_EVENTSTORE_OPTION,
      useFactory: async (optionsFactory: EventStoreOptionsFactory) =>
        await optionsFactory.createEventStoreOptions(options.name),
      inject,
    };
  }
}
