import { ModuleMetadata, Type } from '@nestjs/common/interfaces';
import {ConnectionSettings, TcpEndPoint } from 'node-eventstore-client';
import { EventStoreOptionConfig } from './event-store-option.config';

export interface EventStoreModuleOptions {
  options: ConnectionSettings,
  tcpEndpoint: TcpEndPoint,
}

export interface EventStoreOptionsFactory {
  createEventStoreOptions(
    connectionName?: string,
  ): Promise<EventStoreModuleOptions> | EventStoreModuleOptions;
}

export interface EventStoreModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
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
    connectionName?: string,
  ): Promise<EventStoreOptionConfig> | EventStoreOptionConfig;
}

export interface EventStoreFeatureAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  name?: string;
  useExisting?: Type<EventStoreFeatureOptionsFactory>;
  useClass?: Type<EventStoreFeatureOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<EventStoreOptionConfig> | EventStoreOptionConfig;
  inject?: any[];
}
