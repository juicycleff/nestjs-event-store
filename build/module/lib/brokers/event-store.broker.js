import { Logger } from '@nestjs/common';
import assert from 'assert';
import * as uuid from 'uuid';
import { createConnection } from 'node-eventstore-client';
export class EventStoreBroker {
    logger = new Logger(this.constructor.name);
    client;
    isConnected;
    type;
    constructor() {
        this.type = 'event-store';
    }
    connect(options, endpoint) {
        try {
            this.client = createConnection(options, endpoint);
            this.client.connect();
            this.client.on('connected', () => {
                this.isConnected = true;
                this.logger.log('EventStore connected!');
            });
            this.client.on('closed', () => {
                this.isConnected = false;
                this.logger.error('EventStore closed!');
                this.connect(options, endpoint);
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
//# sourceMappingURL=event-store.broker.js.map