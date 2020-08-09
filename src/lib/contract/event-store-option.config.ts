import { IEvent } from '@nestjs/cqrs';
import * as Long from 'long';
import {
  EventStoreCatchUpSubscription,
  EventStorePersistentSubscription as ESStorePersistentSub,
  EventStoreSubscription as ESVolatileSubscription
} from 'node-eventstore-client';
import { IAdapterStore } from '../adapter';
import { Subscription } from 'node-nats-streaming';

export enum EventStoreSubscriptionType {
  Persistent,
  CatchUp,
  Volatile
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
  lastCheckpoint?: Long | number | null;
}

export interface EventStoreVolatileSubscription {
  type: EventStoreSubscriptionType.Volatile;
  stream: string;
  resolveLinkTos?: boolean;
}

export interface NatsEventStorePersistentSubscription {
  type: EventStoreSubscriptionType.Persistent;
  stream: string;
  durableName: string;
  maxInflight?: number;
  startAt?: number;
  ackWait?: number,
  manualAcks?: boolean
}

export interface NatsEventStoreVolatileSubscription {
  type: EventStoreSubscriptionType.Volatile;
  stream: string;
  startAt?: number,
  maxInflight?: number,
  ackWait?: number,
  manualAcks?: boolean
}

export type EventStoreSubscription =
  | EventStorePersistentSubscription
  | EventStoreCatchupSubscription
  | EventStoreVolatileSubscription;

export type NatsEventStoreSubscription =
  | NatsEventStorePersistentSubscription
  | NatsEventStoreVolatileSubscription;

export interface IEventConstructors {
  [key: string]: (...args: any[]) => IEvent;
}

export interface ExtendedCatchUpSubscription
  extends EventStoreCatchUpSubscription {
  type: 'catch';
  isLive: boolean | undefined;
}

export interface ExtendedPersistentSubscription extends ESStorePersistentSub {
  type: 'persistent';
  isLive?: boolean | undefined;
}

export interface ExtendedVolatileSubscription extends ESVolatileSubscription {
  type: 'volatile';
  isLive?: boolean | undefined;
}

export interface ExtendedNatsPersistentSubscription extends Subscription {
  type: 'persistent';
  isLive?: boolean | undefined;
}

export interface ExtendedNatsVolatileSubscription extends Subscription {
  type: 'volatile';
  isLive?: boolean | undefined;
}

export type EventStoreOptionConfig =
  | {
      type: 'event-store';
      subscriptions: EventStoreSubscription[];
      eventHandlers: IEventConstructors;
      featureStreamName?: string;
      store?: IAdapterStore;
    }
  | {
      type: 'nats';
      subscriptions: NatsEventStoreSubscription[];
      eventHandlers: IEventConstructors;
      featureStreamName?: string;
    };
