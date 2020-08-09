/* tslint:disable:variable-name */
//
// Modified version of this https://github.com/daypaio/nestjs-eventstore/blob/master/src/event-store/eventstore-cqrs/event-store.bus.ts
// special thanks to him.
//

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
import * as Long from 'long';
import { Subject } from 'rxjs';
import { v4 } from 'uuid';
import {
  EventData,
  EventStorePersistentSubscription,
  ResolvedEvent,
  EventStoreCatchUpSubscription,
  EventStoreSubscription as EventStoreVolatileSubscription,
  expectedVersion,
  createJsonEventData
} from 'node-eventstore-client';
import { IAdapterStore } from '../adapter';
import {
  EventStoreOptionConfig,
  IEventConstructors,
  EventStoreSubscriptionType,
  EventStorePersistentSubscription as ESPersistentSubscription,
  EventStoreCatchupSubscription as ESCatchUpSubscription,
  EventStoreVolatileSubscription as ESVolatileSubscription,
  ExtendedCatchUpSubscription,
  ExtendedVolatileSubscription,
  ExtendedPersistentSubscription,
  ProvidersConstants,
  EventStoreModuleOptions
} from '../contract';
import { EventStoreBroker } from '../brokers';

/**
 * @class EventStore
 */
@Injectable()
export class EventStore
  implements IEventPublisher, OnModuleDestroy, OnModuleInit, IMessageSource {
  private logger = new Logger(this.constructor.name);
  private eventStore: EventStoreBroker;
  private store: IAdapterStore;
  private eventHandlers: IEventConstructors;
  private subject$: Subject<IEvent>;
  private readonly featureStream?: string;
  private catchupSubscriptions: Array<
    Promise<ExtendedCatchUpSubscription>
  > = [];
  private catchupSubscriptionsCount: number;

  private persistentSubscriptions: ExtendedPersistentSubscription[] = [];
  private persistentSubscriptionsCount: number;

  private volatileSubscriptions: ExtendedVolatileSubscription[] = [];
  private volatileSubscriptionsCount: number;

  constructor(
    @Inject(ProvidersConstants.EVENT_STORE_PROVIDER) eventStore: any,
    @Inject(ProvidersConstants.EVENT_STORE_CONNECTION_CONFIG_PROVIDER)
    configService: EventStoreModuleOptions,
    @Inject(ProvidersConstants.EVENT_STORE_STREAM_CONFIG_PROVIDER)
    esStreamConfig: EventStoreOptionConfig,
    private readonly explorerService: ExplorerService,
    private readonly eventsBus: EventBus
  ) {
    this.eventStore = eventStore;
    this.featureStream = esStreamConfig.featureStreamName;
    if (esStreamConfig.type === 'event-store') {
      this.store = esStreamConfig.store;
    } else {
      throw new Error('Event store type is not supported');
    }
    this.addEventHandlers(esStreamConfig.eventHandlers);
    if (configService.type === 'event-store') {
      this.eventStore.connect(configService.options, configService.tcpEndpoint);

      const catchupSubscriptions = esStreamConfig.subscriptions.filter(sub => {
        return sub.type === EventStoreSubscriptionType.CatchUp;
      });
      const persistentSubscriptions = esStreamConfig.subscriptions.filter(
        sub => {
          return sub.type === EventStoreSubscriptionType.Persistent;
        }
      );
      const volatileSubscriptions = esStreamConfig.subscriptions.filter(sub => {
        return sub.type === EventStoreSubscriptionType.Volatile;
      });

      this.subscribeToCatchUpSubscriptions(
        catchupSubscriptions as ESCatchUpSubscription[]
      );
      this.subscribeToPersistentSubscriptions(
        persistentSubscriptions as ESPersistentSubscription[]
      );
      this.subscribeToVolatileSubscriptions(
        volatileSubscriptions as ESVolatileSubscription[]
      );
    } else {
      throw new Error('Event store type is not supported');
    }
  }

  async publish(event: IEvent, stream?: string) {
    if (event === undefined) {
      return;
    }
    if (event === null) {
      return;
    }

    const eventPayload: EventData = createJsonEventData(
      v4(),
      event,
      null,
      stream
    );

    const streamId = stream ? stream : this.featureStream;

    try {
      await this.eventStore
        .getClient()
        .appendToStream(streamId, expectedVersion.any, [eventPayload]);
    } catch (err) {
      this.logger.error(err);
    }
  }

  async subscribeToPersistentSubscriptions(
    subscriptions: ESPersistentSubscription[]
  ) {
    this.persistentSubscriptionsCount = subscriptions.length;
    this.persistentSubscriptions = await Promise.all(
      subscriptions.map(async subscription => {
        return await this.subscribeToPersistentSubscription(
          subscription.stream,
          subscription.persistentSubscriptionName
        );
      })
    );
  }

  async subscribeToCatchUpSubscriptions(
    subscriptions: ESCatchUpSubscription[]
  ) {
    this.catchupSubscriptionsCount = subscriptions.length;
    this.catchupSubscriptions = subscriptions.map(async subscription => {
      let lcp = subscription.lastCheckpoint;
      if (this.store) {
        lcp = await this.store.read(this.store.storeKey);
      }
      return this.subscribeToCatchupSubscription(
        subscription.stream,
        subscription.resolveLinkTos,
        lcp
      );
    });
  }

  async subscribeToVolatileSubscriptions(
    subscriptions: ESVolatileSubscription[]
  ) {
    this.volatileSubscriptionsCount = subscriptions.length;
    this.volatileSubscriptions = await Promise.all(
      subscriptions.map(async subscription => {
        return await this.subscribeToVolatileSubscription(
          subscription.stream,
          subscription.resolveLinkTos
        );
      })
    );
  }

  subscribeToCatchupSubscription(
    stream: string,
    resolveLinkTos: boolean = true,
    lastCheckpoint: number | Long | null = 0
  ): ExtendedCatchUpSubscription {
    this.logger.log(`Catching up and subscribing to stream ${stream}!`);
    try {
      return this.eventStore.getClient().subscribeToStreamFrom(
        stream,
        lastCheckpoint,
        resolveLinkTos,
        (sub, payload) => this.onEvent(sub, payload),
        subscription =>
          this.onLiveProcessingStarted(
            subscription as ExtendedCatchUpSubscription
          ),
        (sub, reason, error) =>
          this.onDropped(sub as ExtendedCatchUpSubscription, reason, error)
      ) as ExtendedCatchUpSubscription;
    } catch (err) {
      this.logger.error(err);
    }
  }

  async subscribeToVolatileSubscription(
    stream: string,
    resolveLinkTos: boolean = true
  ): Promise<ExtendedVolatileSubscription> {
    this.logger.log(`Volatile and subscribing to stream ${stream}!`);
    try {
      const resolved = (await this.eventStore.getClient().subscribeToStream(
        stream,
        resolveLinkTos,
        (sub, payload) => this.onEvent(sub, payload),
        (sub, reason, error) =>
          this.onDropped(sub as ExtendedVolatileSubscription, reason, error)
      )) as ExtendedVolatileSubscription;

      this.logger.log('Volatile processing of EventStore events started!');
      resolved.isLive = true;
      return resolved;
    } catch (err) {
      this.logger.error(err);
    }
  }

  get allCatchUpSubscriptionsLive(): boolean {
    const initialized =
      this.catchupSubscriptions.length === this.catchupSubscriptionsCount;
    return (
      initialized &&
      this.catchupSubscriptions.every(async subscription => {
        const s = await subscription;
        return !!s && s.isLive;
      })
    );
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
    subscriptionName: string
  ): Promise<ExtendedPersistentSubscription> {
    try {
      this.logger.log(`
       Connecting to persistent subscription ${subscriptionName} on stream ${stream}!
      `);

      const resolved = (await this.eventStore
        .getClient()
        .connectToPersistentSubscription(
          stream,
          subscriptionName,
          (sub, payload) => this.onEvent(sub, payload),
          (sub, reason, error) =>
            this.onDropped(sub as ExtendedPersistentSubscription, reason, error)
        )) as ExtendedPersistentSubscription;

      resolved.isLive = true;

      return resolved;
    } catch (err) {
      this.logger.error(err.message);
    }
  }

  async onEvent(
    _subscription:
      | EventStorePersistentSubscription
      | EventStoreCatchUpSubscription
      | EventStoreVolatileSubscription,
    payload: ResolvedEvent
  ) {
    const { event } = payload;

    if (!event || !event.isJson) {
      this.logger.error('Received event that could not be resolved!');
      return;
    }

    const handler = this.eventHandlers[event.eventType];
    if (!handler) {
      this.logger.error('Received event that could not be handled!');
      return;
    }

    const rawData = JSON.parse(event.data.toString());
    const data = Object.values(rawData);

    const eventType = event.eventType || rawData.content.eventType;
    if (this.eventHandlers && this.eventHandlers[eventType]) {
      this.subject$.next(this.eventHandlers[event.eventType](...data));
      if (
        this.store &&
        _subscription.constructor.name === 'EventStoreStreamCatchUpSubscription'
      ) {
        await this.store.write(
          this.store.storeKey,
          payload.event.eventNumber.toInt()
        );
      }
    } else {
      Logger.warn(
        `Event of type ${eventType} not handled`,
        this.constructor.name
      );
    }
  }

  onDropped(
    subscription:
      | ExtendedPersistentSubscription
      | ExtendedCatchUpSubscription
      | ExtendedVolatileSubscription,
    _reason: string,
    error: Error
  ) {
    subscription.isLive = false;
    this.logger.error('onDropped => ' + error);
  }

  onLiveProcessingStarted(subscription: ExtendedCatchUpSubscription) {
    subscription.isLive = true;
    this.logger.log('Live processing of EventStore events started!');
  }

  get isLive(): boolean {
    return (
      this.allCatchUpSubscriptionsLive &&
      this.allPersistentSubscriptionsLive &&
      this.allVolatileSubscriptionsLive
    );
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
