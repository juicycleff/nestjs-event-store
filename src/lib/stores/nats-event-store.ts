/* tslint:disable:variable-name */

import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit
} from '@nestjs/common';
import {
  IEvent,
  IEventPublisher,
  EventBus,
  IMessageSource
} from '@nestjs/cqrs';
import { ExplorerService } from '@nestjs/cqrs/dist/services/explorer.service';
import { Subject } from 'rxjs';
import {
  EventStoreOptionConfig,
  IEventConstructors,
  EventStoreSubscriptionType,
  NatsEventStorePersistentSubscription as ESPersistentSubscription,
  NatsEventStoreVolatileSubscription as ESVolatileSubscription,
  ExtendedNatsVolatileSubscription,
  ExtendedNatsPersistentSubscription,
  ProvidersConstants,
  EventStoreModuleOptions
} from '../contract';
import { NatsEventStoreBroker } from '../brokers';
import { SubscriptionOptions } from 'node-nats-streaming';

/**
 * @class EventStore
 */
@Injectable()
export class NatsEventStore
  implements IEventPublisher, OnModuleDestroy, OnModuleInit, IMessageSource {
  private logger = new Logger(this.constructor.name);
  private eventStore: NatsEventStoreBroker;
  private eventHandlers: IEventConstructors;
  private subject$: Subject<IEvent>;
  private readonly featureStream?: string;

  private persistentSubscriptions: ExtendedNatsPersistentSubscription[] = [];
  private persistentSubscriptionsCount: number;

  private volatileSubscriptions: ExtendedNatsVolatileSubscription[] = [];
  private volatileSubscriptionsCount: number;

  constructor(
    @Inject(ProvidersConstants.EVENT_STORE_PROVIDER) eventStore: any,
    @Inject(ProvidersConstants.EVENT_STORE_CONNECTION_CONFIG_PROVIDER)
    private readonly configService: EventStoreModuleOptions,
    @Inject(ProvidersConstants.EVENT_STORE_STREAM_CONFIG_PROVIDER)
    esStreamConfig: EventStoreOptionConfig,
    private readonly explorerService: ExplorerService,
    private readonly eventsBus: EventBus
  ) {
    this.eventStore = eventStore;
    this.featureStream = esStreamConfig.featureStreamName;
    this.addEventHandlers(esStreamConfig.eventHandlers);

    if (configService.type === 'nats') {
      this.eventStore.connect(
        configService.clusterId,
        configService.clientId,
        configService.options
      );
    } else {
      throw new Error('Event store type is not supported  - (nats-event-store.ts)');
    }

    if (esStreamConfig.type === 'nats') {
      const persistentSubscriptions = esStreamConfig.subscriptions.filter(
        sub => {
          return sub.type === EventStoreSubscriptionType.Persistent;
        }
      );
      const volatileSubscriptions = esStreamConfig.subscriptions.filter(sub => {
        return sub.type === EventStoreSubscriptionType.Volatile;
      });

      this.subscribeToPersistentSubscriptions(
        persistentSubscriptions as ESPersistentSubscription[]
      );
      this.subscribeToVolatileSubscriptions(
        volatileSubscriptions as ESVolatileSubscription[]
      );
    } else {
      throw new Error('Event store type is not supported for feature - nats-event-store.ts');
    }
  }

  async publish(event: IEvent, stream?: string) {
    if (event === undefined) {
      return;
    }
    if (event === null) {
      return;
    }

    // tslint:disable-next-line:no-console
    console.log('stream', stream);
    // tslint:disable-next-line:no-console
    console.log('eventPayload', event);
    const payload = Buffer.from(JSON.stringify(event));
    console.log('eventPayload', payload);

    const streamId = this.getStreamId(stream ? stream : this.featureStream);

    try {
      await this.eventStore.getClient().publish(streamId, payload);
    } catch (err) {
      this.logger.error(err);
    }
  }

  private getStreamId(stream) {
    return `nest-event-store/${stream}`;
  }

  async subscribeToPersistentSubscriptions(
    subscriptions: ESPersistentSubscription[]
  ) {
    if (!this.eventStore.isConnected) {
      this.logger.error('eventStore is not connected');
      // return;
    }
    this.persistentSubscriptionsCount = subscriptions.length;
    this.persistentSubscriptions = await Promise.all(
      subscriptions.map(async subscription => {
        return await this.subscribeToPersistentSubscription(
          this.getStreamId(subscription.stream),
          subscription.durableName,
          subscription.maxInflight,
          subscription?.startAt
        );
      })
    );
  }

  async subscribeToVolatileSubscriptions(
    subscriptions: ESVolatileSubscription[]
  ) {
    this.volatileSubscriptionsCount = subscriptions.length;
    /* this.volatileSubscriptions = await Promise.all(
      subscriptions.map(async (subscription) => {
        return await this.subscribeToVolatileSubscription(subscription.stream, subscription.resolveLinkTos);
      })
    ); */
  }

  async subscribeToVolatileSubscription(
    stream: string,
    startAt?: number,
    maxInFlight?: number,
    ackWait?: number,
    manualAcks?: boolean
  ): Promise<ExtendedNatsVolatileSubscription> {
    this.logger.log(`Volatile and subscribing to stream ${stream}!`);
    try {
      const opts = this.eventStore.getClient().subscriptionOptions();
      opts.setAckWait(ackWait);
      opts.setMaxInFlight(maxInFlight);
      opts.setManualAckMode(manualAcks);

      if (startAt) {
        opts.setStartAtSequence(startAt);
      }

      if (this.configService.type === 'event-store') {
        return;
      }

      const resolved = (await this.eventStore
        .getClient()
        .subscribe(
          stream,
          this.configService.groupId,
          opts
        )) as ExtendedNatsVolatileSubscription;
      resolved.on('message', this.handleCallback);
      this.logger.log('Volatile processing of EventStore events started!');
      resolved.isLive = true;
      return resolved;
    } catch (err) {
      this.logger.error(err);
    }
  }

  get allVolatileSubscriptionsLive(): boolean {
    const initialized =
      this.volatileSubscriptions.length === this.volatileSubscriptionsCount;
    return (
      initialized &&
      this.volatileSubscriptions.every(subscription => {
        return !!subscription && subscription.isLive;
      })
    );
  }

  get allPersistentSubscriptionsLive(): boolean {
    const initialized =
      this.persistentSubscriptions.length === this.persistentSubscriptionsCount;
    return (
      initialized &&
      this.persistentSubscriptions.every(subscription => {
        return !!subscription && subscription.isLive;
      })
    );
  }

  async subscribeToPersistentSubscription(
    stream: string,
    durableName: string,
    startAt?: number,
    maxInFlight?: number,
    ackWait?: number,
    manualAcks?: boolean
  ): Promise<ExtendedNatsPersistentSubscription> {
    try {
      this.logger.log(`
       Connecting to persistent subscription ${durableName} on stream ${stream}!
      `);

      const opts = this.eventStore.getClient().subscriptionOptions();
      opts.setDurableName(durableName);
      opts.setAckWait(ackWait);
      opts.setMaxInFlight(maxInFlight);
      opts.setManualAckMode(manualAcks);

      if (startAt) {
        opts.setStartAtSequence(startAt);
      } else {
        opts.setStartWithLastReceived();
      }

      if (this.configService.type === 'event-store') {
        return;
      }

      const resolved = (await this.eventStore
        .getClient()
        .subscribe(
          stream,
          this.configService.groupId,
          opts
        )) as ExtendedNatsPersistentSubscription;
      resolved.isLive = true;
      resolved.on('message', this.handleCallback);

      return resolved;
    } catch (err) {
      this.logger.error(err);
    }
  }

  private async handleCallback(err, msg) {
    // tslint:disable-next-line:no-console
    this.logger.error(err);
    // tslint:disable-next-line:no-console
    this.logger.log(msg);
    if (err) {
      this.onDropped(err);
    } else {
      await this.onEvent(msg);
    }
  }

  async onEvent(payload) {
    // tslint:disable-next-line:no-console
    console.log(payload);
    const handler = this.eventHandlers[payload.subject];
    if (!handler) {
      this.logger.error('Received event that could not be handled!');
      return;
    }

    const data = payload.data;

    const eventType = payload.subject;
    if (this.eventHandlers && this.eventHandlers[eventType]) {
      this.subject$.next(this.eventHandlers[payload.subject](...data));
    } else {
      Logger.warn(
        `Event of type ${eventType} not handled`,
        this.constructor.name
      );
    }
  }

  onDropped(error) {
    // subscription.isLive = false;
    this.logger.error('onError => ' + error.message);
  }

  get isLive(): boolean {
    /* return (
      this.allCatchUpSubscriptionsLive && this.allPersistentSubscriptionsLive && this.allVolatileSubscriptionsLive
    ); */
    return false;
  }

  addEventHandlers(eventHandlers: IEventConstructors) {
    this.eventHandlers = { ...this.eventHandlers, ...eventHandlers };
  }
  onModuleInit(): any {
    this.subject$ = (this.eventsBus as any).subject$;
    this.bridgeEventsTo((this.eventsBus as any).subject$);
    this.eventsBus.publisher = this;
  }

  onModuleDestroy(): any {
    this.eventStore.close();
  }

  async bridgeEventsTo<T extends IEvent>(subject: Subject<T>): Promise<any> {
    this.subject$ = subject;
  }
}
