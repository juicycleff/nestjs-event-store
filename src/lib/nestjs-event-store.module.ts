import { DynamicModule, Global, Module } from '@nestjs/common';
import { EventStoreOptionConfig } from './contract/event-store-option.config';
import { ProvidersConstants } from './contract/nestjs-event-store.constant';
import { EventStore } from './event-store';
import { IEventStoreConnectConfig } from './contract/event-store-connect-config.interface';
import { eventStoreProviders } from './providers/nestjs-event-store.provider';
import { ExplorerService } from '@nestjs/cqrs/dist/services/explorer.service';
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
export class NestjsEventStoreModule {

  static forRoot(option: IEventStoreConnectConfig): DynamicModule {
    const configProv = {
        provide: ProvidersConstants.EVENT_STORE_CONNECTION_CONFIG_PROVIDER,
        useValue: {
          ...option,
        },
      };
    return {
      module: NestjsEventStoreModule,
      providers: [configProv],
      exports: [configProv],
    };
  }

  static forFeature(config: EventStoreOptionConfig): DynamicModule {

    if (config === undefined || config === null) {
      throw new Error('Config missing');
    }

    return {
      module: NestjsEventStoreModule,
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
