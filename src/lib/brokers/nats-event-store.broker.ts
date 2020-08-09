import { Logger } from '@nestjs/common';
import assert from 'assert';
import * as uuid from 'uuid';
import { ClientOpts, connect as stanConnect, Stan } from 'node-nats-streaming';
import { BrokerTypes } from '../contract';

/**
 * @description Event store setup from NATS
 */
export class NatsEventStoreBroker {
  [x: string]: any;
  private logger: Logger = new Logger(this.constructor.name);
  private client: Stan;
  public isConnected: boolean;
  type: BrokerTypes;

  constructor() {
    this.type = 'nats';
    this.clientId = uuid.v4();
  }

  connect(clusterId: string, clientId: string, options: ClientOpts) {
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
    } catch (e) {
      this.logger.error(e);
      throw new Error(e);
    }
  }

  getClient(): Stan {
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
   * Close event store connection
   */
  close() {
    this.client.close();
    return this;
  }
}
