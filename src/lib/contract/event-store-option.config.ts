
import { IEvent } from '@nestjs/cqrs';
import * as Long from 'long';
import {
  EventStoreCatchUpSubscription,
  EventStorePersistentSubscription as ESStorePersistentSub,
  EventStoreSubscription as ESVolatileSubscription,
} from 'node-eventstore-client';

export enum EventStoreSubscriptionType {
  Persistent,
  CatchUp,
  Volatile,
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
  lastCheckpoint?: Long|number|null;
}

export interface EventStoreVolatileSubscription {
  type: EventStoreSubscriptionType.Volatile;
  stream: string;
  resolveLinkTos?: boolean;
}

export type EventStoreSubscription =
  | EventStorePersistentSubscription
  | EventStoreCatchupSubscription
  | EventStoreVolatileSubscription;

export interface IEventConstructors {
  [key: string]: (...args: any[]) => IEvent;
}

export interface ExtendedCatchUpSubscription extends EventStoreCatchUpSubscription {
  isLive: boolean | undefined;
}

export interface ExtendedPersistentSubscription extends ESStorePersistentSub {
  isLive?: boolean | undefined;
}

export interface ExtendedVolatileSubscription extends ESVolatileSubscription {
  isLive?: boolean | undefined;
}

export interface EventStoreOptionConfig {
  subscriptions: EventStoreSubscription[];
  eventHandlers: IEventConstructors;
  featureStreamName?: string;
}
