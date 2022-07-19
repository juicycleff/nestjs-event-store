import { ClientOpts, Stan } from 'node-nats-streaming';
import { BrokerTypes } from '../contract';
export declare class NatsEventStoreBroker {
    [x: string]: any;
    private logger;
    private client;
    isConnected: boolean;
    type: BrokerTypes;
    constructor();
    connect(clusterId: string, clientId: string, options: ClientOpts): this;
    getClient(): Stan;
    newEvent(name: any, payload: any): {
        eventId: any;
        eventType?: any;
        data?: any;
        metadata?: any;
    };
    private newEventBuilder;
    close(): this;
}
