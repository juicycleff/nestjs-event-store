import {ConnectionSettings, TcpEndPoint } from 'node-eventstore-client';

export interface IEventStoreConnectConfig {
  options: ConnectionSettings,
  tcpEndpoint: TcpEndPoint,
}
