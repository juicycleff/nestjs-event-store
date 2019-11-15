import { DynamicModule, Module } from '@nestjs/common';
import { EventStoreOptionConfig } from './contract/event-store-option.config';
import { ProvidersConstants } from './contract/nestjs-event-store.constant';
import { EventStore } from './event-store';
import { IEventStoreConnectConfig } from './contract/event-store-connect-config.interface';
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

  static forRoot(option: IEventStoreConnectConfig): DynamicModule {
    return {
      module: NestjsEventStoreCoreModule,
      imports: [NestjsEventStoreCoreModule.forRoot(option)],
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
}
