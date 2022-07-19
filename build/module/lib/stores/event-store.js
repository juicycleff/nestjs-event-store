var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { v4 } from 'uuid';
import { expectedVersion, createJsonEventData } from 'node-eventstore-client';
import { EventStoreSubscriptionType, ProvidersConstants } from '../contract';
let EventStore = class EventStore {
    eventsBus;
    logger = new Logger(this.constructor.name);
    eventStore;
    store;
    eventHandlers;
    subject$;
    featureStream;
    catchupSubscriptions = [];
    catchupSubscriptionsCount;
    persistentSubscriptions = [];
    persistentSubscriptionsCount;
    volatileSubscriptions = [];
    volatileSubscriptionsCount;
    constructor(eventStore, configService, esStreamConfig, eventsBus) {
        this.eventsBus = eventsBus;
        this.eventStore = eventStore;
        this.featureStream = esStreamConfig.featureStreamName;
        if (esStreamConfig.type === 'event-store') {
            this.store = esStreamConfig.store;
        }
        else {
            throw new Error('Event store type is not supported - (event-tore.ts)');
        }
        this.addEventHandlers(esStreamConfig.eventHandlers);
        if (configService.type === 'event-store') {
            this.eventStore.connect(configService.options, configService.tcpEndpoint);
            const catchupSubscriptions = esStreamConfig.subscriptions.filter(sub => {
                return sub.type === EventStoreSubscriptionType.CatchUp;
            });
            const persistentSubscriptions = esStreamConfig.subscriptions.filter(sub => {
                return sub.type === EventStoreSubscriptionType.Persistent;
            });
            const volatileSubscriptions = esStreamConfig.subscriptions.filter(sub => {
                return sub.type === EventStoreSubscriptionType.Volatile;
            });
            this.subscribeToCatchUpSubscriptions(catchupSubscriptions);
            this.subscribeToPersistentSubscriptions(persistentSubscriptions);
            this.subscribeToVolatileSubscriptions(volatileSubscriptions);
        }
        else {
            throw new Error('Event store type is not supported for feature - (event-tore.ts)');
        }
    }
    async publish(event, stream) {
        if (event === undefined) {
            return;
        }
        if (event === null) {
            return;
        }
        const eventPayload = createJsonEventData(v4(), event, null, stream);
        const streamId = stream ? stream : this.featureStream;
        try {
            await this.eventStore
                .getClient()
                .appendToStream(streamId, expectedVersion.any, [eventPayload]);
        }
        catch (err) {
            this.logger.error(err);
        }
    }
    async subscribeToPersistentSubscriptions(subscriptions) {
        this.persistentSubscriptionsCount = subscriptions.length;
        this.persistentSubscriptions = await Promise.all(subscriptions.map(async (subscription) => {
            return await this.subscribeToPersistentSubscription(subscription.stream, subscription.persistentSubscriptionName);
        }));
    }
    async subscribeToCatchUpSubscriptions(subscriptions) {
        this.catchupSubscriptionsCount = subscriptions.length;
        this.catchupSubscriptions = subscriptions.map(async (subscription) => {
            let lcp = subscription.lastCheckpoint;
            if (this.store) {
                lcp = await this.store.read(this.store.storeKey);
            }
            return this.subscribeToCatchupSubscription(subscription.stream, subscription.resolveLinkTos, lcp);
        });
    }
    async subscribeToVolatileSubscriptions(subscriptions) {
        this.volatileSubscriptionsCount = subscriptions.length;
        this.volatileSubscriptions = await Promise.all(subscriptions.map(async (subscription) => {
            return await this.subscribeToVolatileSubscription(subscription.stream, subscription.resolveLinkTos);
        }));
    }
    subscribeToCatchupSubscription(stream, resolveLinkTos = true, lastCheckpoint = 0) {
        this.logger.log(`Catching up and subscribing to stream ${stream}!`);
        try {
            return this.eventStore.getClient().subscribeToStreamFrom(stream, lastCheckpoint, resolveLinkTos, (sub, payload) => this.onEvent(sub, payload), subscription => this.onLiveProcessingStarted(subscription), (sub, reason, error) => this.onDropped(sub, reason, error));
        }
        catch (err) {
            this.logger.error(err);
        }
    }
    async subscribeToVolatileSubscription(stream, resolveLinkTos = true) {
        this.logger.log(`Volatile and subscribing to stream ${stream}!`);
        try {
            const resolved = (await this.eventStore.getClient().subscribeToStream(stream, resolveLinkTos, (sub, payload) => this.onEvent(sub, payload), (sub, reason, error) => this.onDropped(sub, reason, error)));
            this.logger.log('Volatile processing of EventStore events started!');
            resolved.isLive = true;
            return resolved;
        }
        catch (err) {
            this.logger.error(err);
        }
    }
    get allCatchUpSubscriptionsLive() {
        const initialized = this.catchupSubscriptions.length === this.catchupSubscriptionsCount;
        return (initialized &&
            this.catchupSubscriptions.every(async (subscription) => {
                const s = await subscription;
                return !!s && s.isLive;
            }));
    }
    get allVolatileSubscriptionsLive() {
        const initialized = this.volatileSubscriptions.length === this.volatileSubscriptionsCount;
        return (initialized &&
            this.volatileSubscriptions.every(subscription => {
                return !!subscription && subscription.isLive;
            }));
    }
    get allPersistentSubscriptionsLive() {
        const initialized = this.persistentSubscriptions.length === this.persistentSubscriptionsCount;
        return (initialized &&
            this.persistentSubscriptions.every(subscription => {
                return !!subscription && subscription.isLive;
            }));
    }
    async subscribeToPersistentSubscription(stream, subscriptionName) {
        try {
            this.logger.log(`
       Connecting to persistent subscription ${subscriptionName} on stream ${stream}!
      `);
            const resolved = (await this.eventStore
                .getClient()
                .connectToPersistentSubscription(stream, subscriptionName, (sub, payload) => this.onEvent(sub, payload), (sub, reason, error) => this.onDropped(sub, reason, error)));
            resolved.isLive = true;
            return resolved;
        }
        catch (err) {
            this.logger.error(err.message);
        }
    }
    async onEvent(_subscription, payload) {
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
            if (this.store &&
                _subscription.constructor.name === 'EventStoreStreamCatchUpSubscription') {
                await this.store.write(this.store.storeKey, payload.event.eventNumber.toInt());
            }
        }
        else {
            Logger.warn(`Event of type ${eventType} not handled`, this.constructor.name);
        }
    }
    onDropped(subscription, _reason, error) {
        subscription.isLive = false;
        this.logger.error('onDropped => ' + error);
    }
    onLiveProcessingStarted(subscription) {
        subscription.isLive = true;
        this.logger.log('Live processing of EventStore events started!');
    }
    get isLive() {
        return (this.allCatchUpSubscriptionsLive &&
            this.allPersistentSubscriptionsLive &&
            this.allVolatileSubscriptionsLive);
    }
    addEventHandlers(eventHandlers) {
        this.eventHandlers = { ...this.eventHandlers, ...eventHandlers };
    }
    onModuleInit() {
        this.subject$ = this.eventsBus.subject$;
        this.bridgeEventsTo(this.eventsBus.subject$);
        this.eventsBus.publisher = this;
    }
    onModuleDestroy() {
        this.eventStore.close();
    }
    async bridgeEventsTo(subject) {
        this.subject$ = subject;
    }
};
EventStore = __decorate([
    Injectable(),
    __param(0, Inject(ProvidersConstants.EVENT_STORE_PROVIDER)),
    __param(1, Inject(ProvidersConstants.EVENT_STORE_CONNECTION_CONFIG_PROVIDER)),
    __param(2, Inject(ProvidersConstants.EVENT_STORE_STREAM_CONFIG_PROVIDER)),
    __metadata("design:paramtypes", [Object, Object, Object, EventBus])
], EventStore);
export { EventStore };
//# sourceMappingURL=event-store.js.map