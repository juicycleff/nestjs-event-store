import { ModuleMetadata, Type } from '@nestjs/common/interfaces';
import {ConnectionSettings, TcpEndPoint } from 'node-eventstore-client';

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
