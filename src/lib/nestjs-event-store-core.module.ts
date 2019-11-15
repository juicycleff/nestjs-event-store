import { DynamicModule, Global, Module } from '@nestjs/common';
import { ProvidersConstants } from './contract/nestjs-event-store.constant';
import { IEventStoreConnectConfig } from './contract/event-store-connect-config.interface';
import { eventStoreProviders } from './providers/nestjs-event-store.provider';
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
export class NestjsEventStoreCoreModule {

  static forRoot(option: IEventStoreConnectConfig): DynamicModule {
    const configProv = {
      provide: ProvidersConstants.EVENT_STORE_CONNECTION_CONFIG_PROVIDER,
      useValue: {
        ...option,
      },
    };
    return {
      module: NestjsEventStoreCoreModule,
      providers: [configProv],
      exports: [configProv],
    };
  }
}
