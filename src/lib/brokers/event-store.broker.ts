import { Logger } from '@nestjs/common';
import assert from 'assert';
import uuid from 'uuid';
import {
  EventStoreNodeConnection,
  ConnectionSettings,
  TcpEndPoint,
  createConnection
} from 'node-eventstore-client';
import { BrokerTypes } from '../contract';

/**
 * @description Event store setup from eventstore.org
 */
export class EventStoreBroker {
  [x: string]: any;
  private logger: Logger = new Logger(this.constructor.name);
  private client: EventStoreNodeConnection;
  public isConnected: boolean;
  type: BrokerTypes;

  constructor() {
    this.type = 'event-store';
  }

  connect(options: ConnectionSettings, endpoint: TcpEndPoint) {
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
    } catch (e) {
      this.logger.error(e);
      throw new Error(e);
    }
  }

  getClient(): EventStoreNodeConnection {
    return this.client;
  }

  newEvent(name, payload) {
    return this.newEventBuilder(name, payload);
  }

  private newEventBuilder(eventType, data, metadata?, eventId?) {
    assert(eventType);
    assert(data);

    const event: {
      eventId: string | any;
      eventType?: string | any;
      data?: any;
      metadata?: any;
    } = {
      eventId: eventId || uuid.v4(),
      eventType,
      data
    };

    if (metadata !== undefined) {
      event.metadata = metadata;
    }
    return event;
  }

  /**
   * Close event store client
   */
  close() {
    this.client.close();
    return this;
  }
}
