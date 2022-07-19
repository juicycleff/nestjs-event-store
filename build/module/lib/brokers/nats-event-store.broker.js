import { Logger } from '@nestjs/common';
import assert from 'assert';
import * as uuid from 'uuid';
import { connect as stanConnect } from 'node-nats-streaming';
export class NatsEventStoreBroker {
    logger = new Logger(this.constructor.name);
    client;
    isConnected;
    type;
    constructor() {
        this.type = 'nats';
        this.clientId = uuid.v4();
    }
    connect(clusterId, clientId, options) {
        try {
            if (clientId) {
                this.clientId = clientId;
            }
            this.client = stanConnect(clusterId, this.clientId, options);
            this.client.on('connect', () => {
                this.isConnected = true;
                this.logger.log('Nats Streaming EventStore connected!');
            });
            this.client.on('disconnect:', () => {
                this.isConnected = false;
                this.logger.error('Nats Streaming EventStore disconnected!');
                this.connect(clusterId, this.clientId, options);
            });
            this.client.on('close:', () => {
                this.isConnected = false;
                this.logger.error('Nats Streaming EventStore closed!');
                this.connect(clusterId, this.clientId, options);
            });
            return this;
        }
        catch (e) {
            this.logger.error(e);
            throw new Error(e);
        }
    }
    getClient() {
        return this.client;
    }
    newEvent(name, payload) {
        return this.newEventBuilder(name, payload);
    }
    newEventBuilder(eventType, data, metadata, eventId) {
        assert(eventType);
        assert(data);
        const event = {
            eventId: eventId || uuid.v4(),
            eventType,
            data
        };
        if (metadata !== undefined) {
            event.metadata = metadata;
        }
        return event;
    }
    close() {
        this.client.close();
        return this;
    }
}
//# sourceMappingURL=nats-event-store.broker.js.map