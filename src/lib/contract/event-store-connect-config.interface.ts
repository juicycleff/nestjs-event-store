import { ModuleMetadata, Type } from '@nestjs/common/interfaces';
import { ConnectionSettings, TcpEndPoint } from 'node-eventstore-client';
import { EventStoreOptionConfig } from './event-store-option.config';
import { ClientOpts } from 'node-nats-streaming';
import { BrokerTypes } from './shared-store.interface';

export type EventStoreModuleOptions =
  | {
      type: 'event-store';
      options: ConnectionSettings;
      tcpEndpoint: TcpEndPoint;
    }
  | {
      type: 'nats';
      clusterId: string;
      clientId?: string;
      groupId?: string;
      options: ClientOpts;
    };

export interface EventStoreOptionsFactory {
  createEventStoreOptions(
    connectionName?: string
  ): Promise<EventStoreModuleOptions> | EventStoreModuleOptions;
}

export interface EventStoreModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  type: BrokerTypes;
  name?: string;
  useExisting?: Type<EventStoreOptionsFactory>;
  useClass?: Type<EventStoreOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<EventStoreModuleOptions> | EventStoreModuleOptions;
  inject?: any[];
}

export interface EventStoreFeatureOptionsFactory {
  createFeatureOptions(
    connectionName?: string
  ): Promise<EventStoreOptionConfig> | EventStoreOptionConfig;
}

export interface EventStoreFeatureAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  name?: string;
  type: BrokerTypes;
  useExisting?: Type<EventStoreFeatureOptionsFactory>;
  useClass?: Type<EventStoreFeatureOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<EventStoreOptionConfig> | EventStoreOptionConfig;
  inject?: any[];
}
