import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { IEvent, IEventPublisher, EventBus, IMessageSource } from '@nestjs/cqrs';
import { Subject } from 'rxjs';
import { EventStoreOptionConfig, IEventConstructors, NatsEventStorePersistentSubscription as ESPersistentSubscription, NatsEventStoreVolatileSubscription as ESVolatileSubscription, ExtendedNatsVolatileSubscription, ExtendedNatsPersistentSubscription, EventStoreModuleOptions } from '../contract';
import { Message } from 'node-nats-streaming';
export declare class NatsEventStore implements IEventPublisher, OnModuleDestroy, OnModuleInit, IMessageSource {
    private readonly configService;
    private readonly esStreamConfig;
    private readonly eventsBus;
    private logger;
    private eventStore;
    private eventHandlers;
    private subject$;
    private readonly featureStream?;
    private persistentSubscriptions;
    private persistentSubscriptionsCount;
    private volatileSubscriptions;
    private volatileSubscriptionsCount;
    constructor(eventStore: any, configService: EventStoreModuleOptions, esStreamConfig: EventStoreOptionConfig, eventsBus: EventBus);
    private initSubs;
    publish(event: IEvent & {
        handlerType?: string;
    }, stream?: string): Promise<void>;
    private getStreamId;
    subscribeToPersistentSubscriptions(subscriptions: ESPersistentSubscription[]): Promise<void>;
    subscribeToVolatileSubscriptions(subscriptions: ESVolatileSubscription[]): Promise<void>;
    subscribeToVolatileSubscription(stream: string, startAt?: number, maxInFlight?: number, ackWait?: number, manualAcks?: boolean): Promise<ExtendedNatsVolatileSubscription>;
    get allVolatileSubscriptionsLive(): boolean;
    get allPersistentSubscriptionsLive(): boolean;
    subscribeToPersistentSubscription(stream: string, durableName: string, startAt?: number, maxInFlight?: number, ackWait?: number, manualAcks?: boolean): Promise<ExtendedNatsPersistentSubscription>;
    onEvent(payload: Message): Promise<void>;
    onDropped(error: any): void;
    get isLive(): boolean;
    addEventHandlers(eventHandlers: IEventConstructors): void;
    onModuleInit(): any;
    onModuleDestroy(): any;
    bridgeEventsTo<T extends IEvent>(subject: Subject<T>): Promise<any>;
}
