import { EventStoreNodeConnection, ConnectionSettings, TcpEndPoint } from 'node-eventstore-client';
import { BrokerTypes } from '../contract';
export declare class EventStoreBroker {
    [x: string]: any;
    private logger;
    private client;
    isConnected: boolean;
    type: BrokerTypes;
    constructor();
    connect(options: ConnectionSettings, endpoint: TcpEndPoint): this;
    getClient(): EventStoreNodeConnection;
    newEvent(name: any, payload: any): {
        eventId: any;
        eventType?: any;
        data?: any;
        metadata?: any;
    };
    private newEventBuilder;
    close(): this;
}
