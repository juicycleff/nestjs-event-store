import { Logger } from '@nestjs/common';
import assert from 'assert';
import uuid from 'uuid';
import { EventStoreNodeConnection, ConnectionSettings, TcpEndPoint, createConnection } from 'node-eventstore-client';

/**
 * @description Event store setup from eventstore.org
 */
export class EventStoreBroker {
  [x: string]: any;
  private logger: Logger = new Logger(this.constructor.name);
  private connection: EventStoreNodeConnection;
  public isConnected: boolean;

  constructor() {
    this.type = 'event-store';
  }

  connect(options: ConnectionSettings, endpoint: TcpEndPoint) {

    try {
      this.connection = createConnection(options, endpoint);
      this.connection.connect();

      this.connection.on('connected', () => {
        this.isConnected = true;
        this.logger.log('EventStore connected!');
      });
      this.connection.on('closed', () => {
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

  getConnection(): EventStoreNodeConnection {
    return this.connection;
  }

  newEvent(name, payload) {
    return this.newEventBuilder(name, payload);
  }

  private newEventBuilder(eventType, data, metadata?, eventId?) {
    assert(eventType);
    assert(data);

    const event: {
      eventId: string | any,
      eventType?: string | any,
      data?: any,
      metadata?: any,
    } = {
      eventId: eventId || uuid.v4(),
      eventType,
      data
    };

    if (metadata !== undefined) { event.metadata = metadata; }
    return event;
  }

  /**
   * Close event store connection
   */
  close() {
    this.connection.close();
    return this;
  }
}
