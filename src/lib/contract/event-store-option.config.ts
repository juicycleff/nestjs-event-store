
import { IEvent } from '@nestjs/cqrs';
import { EventStoreCatchUpSubscription, EventStorePersistentSubscription as ESStorePersistentSub } from 'node-eventstore-client';

export enum EventStoreSubscriptionType {
  Persistent,
  CatchUp,
}

export interface EventStorePersistentSubscription {
  type: EventStoreSubscriptionType.Persistent;
  stream: string;
  persistentSubscriptionName: string;
  resolveLinkTos?: boolean;
}

export interface EventStoreCatchupSubscription {
  type: EventStoreSubscriptionType.CatchUp;
  stream: string;
  resolveLinkTos?: boolean;
}

export interface EventStoreSubscriptionConfig {
  persistentSubscriptionName: string;
}

export type EventStoreSubscription =
  | EventStorePersistentSubscription
  | EventStoreCatchupSubscription;

export interface IEventConstructors {
  [key: string]: (...args: any[]) => IEvent;
}

export interface ExtendedCatchUpSubscription extends EventStoreCatchUpSubscription {
  isLive: boolean | undefined;
}

export interface ExtendedPersistentSubscription extends ESStorePersistentSub {
  isLive?: boolean | undefined;
}

export interface EventStoreOptionConfig {
  subscriptions: EventStoreSubscription[];
  eventHandlers: IEventConstructors;
  featureStreamName?: string;
}
