import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common';
import {
  EventStoreModuleAsyncOptions,
  EventStoreModuleOptions,
  EventStoreOptionsFactory,
  NEST_EVENTSTORE_OPTION,
  ProvidersConstants
} from './contract';
import { eventStoreProviders } from './providers';
import { CqrsModule } from '@nestjs/cqrs';

@Global()
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
export class EventStoreCoreModule {

  static register(option: EventStoreModuleOptions): DynamicModule {
    const configProv = {
      provide: ProvidersConstants.EVENT_STORE_CONNECTION_CONFIG_PROVIDER,
      useValue: {
        ...option,
      },
    };
    return {
      module: EventStoreCoreModule,
      providers: [configProv],
      exports: [configProv],
    };
  }

  static registerAsync(options: EventStoreModuleAsyncOptions): DynamicModule {
    const configProv: Provider = {
      provide: ProvidersConstants.EVENT_STORE_CONNECTION_CONFIG_PROVIDER,
      useFactory: async (esOptions: EventStoreModuleOptions) => {
        return {
          ...esOptions,
        }
      },
      inject: [NEST_EVENTSTORE_OPTION],
    };

    const asyncProviders = this.createAsyncProviders(options);

    return {
      module: EventStoreCoreModule,
      imports: options.imports,
      providers: [
        ...asyncProviders,
        configProv
      ],
      exports: [configProv],
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
