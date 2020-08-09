<h1 align="center">
NestJs Event Store
</h1>
  
<p align="center">
  NestJS CQRS module with support EventStore.org and NATS Streaming. It requires @nestjs/cqrs.
</p>
    <p align="center">
</p>

<p align="center">
<a href="https://www.npmjs.com/package/@juicycleff/nestjs-event-store" target="_blank"><img src="https://img.shields.io/npm/v/@juicycleff/nestjs-event-store?style=flat-square" alt="NPM Version"/></a>
<a href="https://img.shields.io/npm/l/@juicycleff/nestjs-event-store?style=flat-square" target="_blank"><img src="https://img.shields.io/npm/l/@juicycleff/nestjs-event-store?style=flat-square" alt="License"/></a>
<a href="https://img.shields.io/github/languages/code-size/juicycleff/nestjs-event-store?style=flat-square" target="_blank"><img src="https://img.shields.io/github/languages/code-size/juicycleff/nestjs-event-store?style=flat-square" alt="Code Size"/></a>
<a href="https://img.shields.io/github/languages/top/juicycleff/nestjs-event-store?style=flat-square" target="_blank"><img src="https://img.shields.io/github/languages/top/juicycleff/nestjs-event-store?style=flat-square" alt="Top Language"/></a>
<a href="https://img.shields.io/codacy/grade/0944a2f07aca403da4d4637606af7478?style=flat-square" target="_blank"><img src="https://img.shields.io/codacy/grade/dc460840375d4ac995f5647a5ed10179?style=flat-square" alt="Top Language"/></a>
</p>

## Installation

```bash
$ yarn add @juicycleff/nestjs-event-store
$ yarn add node-nats-streaming node-eventstore-client
```

## Description
This module aims to bridge the gap between NestJs and popular event store brokers like [Event Store](https://eventstore.org) and [NATS Streaming](https://nats.io) with support for kafka coming.

#### [Event Store](https://eventstore.org)
It supports all different subscription strategies in EventStore.Org,
such as Volatile, CatchUp and Persistent subscriptions fairly easily. There is support for a storage adapter interface for storing catchup events type last checkpoint position, so
the checkpoint can be read on start up; The adapter interface is very slim and easy and can be assigned preferably using the `EventStoreModule.registerFeatureAsync` method.
Adapter data store examples coming soon.

Note: if your event broker type is Event Store then featureStreamName should look like `'$ce-user'`, then you should name your domain argument should be `user` without `$ce`, for example.

```typescript
export class UserCreatedEvent implements IEvent {
    constructor(
        public readonly user: any // This what im talking about.
    )  { }
}
```
The way this works is we group the event based the first argument in the constructor name and this argument name must be a substring of featureStreamName. I'm sorry you can't pass you your own unique name at the moment, but I will add support for it

#### [NATS Streaming](https://nats.io)
It supports all both durable/persistent subscription with shared subscription and volatile. It does not have the limitations of [Event Store](https://eventstore.org) stated above.

Note: if your event broker type is NATS then featureStreamName  should look like `'user'`.

### Setup from versions from `v3.1.15`
#### Setup NATS
##### Setup root app module for NATS

```typescript
import { Module } from '@nestjs/common';
import { EventStoreModule } from '@juicycleff/nestjs-event-store';

@Module({
  imports: [
    EventStoreModule.register({
      type: 'nats',
      groupId: 'groupId',
      clusterId: 'clusterId',
      clientId: 'clientId', // Optional (Auto generated with uuid)
      options: {
        url: 'nats://localhost:4222',
        reconnect: true,
        maxReconnectAttempts: -1,
      },
    }),
  ]
})
export class AppModule {}
```

##### Setup async root app module
```typescript
import { Module } from '@nestjs/common';
import { EventStoreModule } from '@juicycleff/nestjs-event-store';
import { EventStoreConfigService } from './eventstore-config.service';

@Module({
  imports: [
    EventStoreModule.registerAsync({
      type: 'nats',
      useClass: EventStoreConfigService
    }),
  ]
})
export class AppModule {}
```

##### Setup feature module
```typescript
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { AccountEventHandlers, UserLoggedInEvent } from '@ultimatebackend/core';
import { AccountSagas } from '../common';
import { EventStoreModule, EventStoreSubscriptionType } from '@juicycleff/nestjs-event-store';

@Module({
  imports: [
    EventStoreModule.registerFeature({
      featureStreamName: 'user',
      type: 'nats',
      subscriptions: [
        {
          type: EventStoreSubscriptionType.Persistent,
          stream: 'account',
          durableName: 'svc-user',
        }
      ],
      eventHandlers: {
        UserLoggedInEvent: (data) => new UserLoggedInEvent(data),
      },
    })
  ],
  providers: [...AccountEventHandlers, AccountSagas],
  controllers: [UsersController],
})
export class UsersModule {}
```

#### Setup EventStore
##### Setup root app module for EventStore

```typescript
import { Module } from '@nestjs/common';
import { EventStoreModule } from '@juicycleff/nestjs-event-store';

@Module({
  imports: [
    EventStoreModule.register({
      type: 'event-store',
      tcpEndpoint: {
        host: 'localhost',
        port: 1113,
      },
      options: {
        maxRetries: 1000, // Optional
        maxReconnections: 1000,  // Optional
        reconnectionDelay: 1000,  // Optional
        heartbeatInterval: 1000,  // Optional
        heartbeatTimeout: 1000,  // Optional
        defaultUserCredentials: {
          password: 'admin',
          username: 'chnageit',
        },
      },
    }),
  ]
})
export class AppModule {}
```

##### Setup async root app module
```typescript
import { Module } from '@nestjs/common';
import { EventStoreModule } from '@juicycleff/nestjs-event-store';
import { EventStoreConfigService } from './eventstore-config.service';

@Module({
  imports: [
    EventStoreModule.registerAsync({
      type: 'event-store',
      useClass: EventStoreConfigService
    }),
  ]
})
export class AppModule {}
```

##### Setup feature module
```typescript
import { Module } from '@nestjs/common';
import { CommandBus, CqrsModule, EventBus } from '@nestjs/cqrs';
import { EventStoreModule, EventStore, EventStoreSubscriptionType } from '@juicycleff/nestjs-event-store';

import {
  UserCommandHandlers,
  UserLoggedInEvent,
  UserEventHandlers,
  UserQueryHandlers,
} from '../cqrs';
import { UserSagas } from './sagas';
import { MongoStore } from './mongo-eventstore-adapter';

@Module({
  imports: [
    CqrsModule,
    EventStoreModule.registerFeature({
      featureStreamName: '$ce-user',
      type: 'event-store',
      store: MongoStore, // Optional mongo store for persisting catchup events position for microservices to mitigate failures. Must implement IAdapterStore
      subscriptions: [
        {
          type: EventStoreSubscriptionType.CatchUp,
          stream: '$ce-user',
          resolveLinkTos: true, // Default is true (Optional)
          lastCheckpoint: 13, // Default is 0 (Optional)
        },
      ],
      eventHandlers: {
        UserLoggedInEvent: (data) => new UserLoggedInEvent(data),
      },
    }),
  ],
  
  providers: [
    UserSagas,
    ...UserQueryHandlers,
    ...UserCommandHandlers,
    ...UserEventHandlers,
  ],
})
export class UserModule {}
```

### Setup from versions from `v3.0.0 to 3.0.5`
##### Setup root app module

```typescript
import { Module } from '@nestjs/common';
import { EventStoreModule } from '@juicycleff/nestjs-event-store';

@Module({
  imports: [
    EventStoreModule.register({
      tcpEndpoint: {
        host: process.env.ES_TCP_HOSTNAME || AppConfig.eventstore?.hostname,
        port: parseInt(process.env.ES_TCP_PORT, 10) || AppConfig.eventstore?.tcpPort,
      },
      options: {
        maxRetries: 1000, // Optional
        maxReconnections: 1000,  // Optional
        reconnectionDelay: 1000,  // Optional
        heartbeatInterval: 1000,  // Optional
        heartbeatTimeout: 1000,  // Optional
        defaultUserCredentials: {
          password: AppConfig.eventstore?.tcpPassword,
          username: AppConfig.eventstore?.tcpUsername,
        },
      },
    }),
  ]
})
export class AppModule {}
```

##### Setup async root app module
```typescript
import { Module } from '@nestjs/common';
import { EventStoreModule } from '@juicycleff/nestjs-event-store';
import { EventStoreConfigService } from './eventstore-config.service';

@Module({
  imports: [
    EventStoreModule.registerAsync({
      useClass: EventStoreConfigService
    }),
  ]
})
export class AppModule {}
```

## Setup module
*Note* `featureStreamName` field is not important if you're subscription type is persistent'

##### Setup feature module
```typescript
import { Module } from '@nestjs/common';
import { CommandBus, CqrsModule, EventBus } from '@nestjs/cqrs';
import { EventStoreModule, EventStore, EventStoreSubscriptionType } from '@juicycleff/nestjs-event-store';

import {
  UserCommandHandlers,
  UserCreatedEvent,
  UserEventHandlers,
  UserQueryHandlers,
} from '../cqrs';
import { UserSagas } from './sagas';
import { MongoStore } from './mongo-eventstore-adapter';

@Module({
  imports: [
    CqrsModule,
    EventStoreModule.registerFeature({
      featureStreamName: '$ce-user',
      store: MongoStore, // Optional mongo store for persisting catchup events position for microservices to mitigate failures. Must implement IAdapterStore
      subscriptions: [
        {
          type: EventStoreSubscriptionType.CatchUp,
          stream: '$ce-user',
          resolveLinkTos: true, // Default is true (Optional)
          lastCheckpoint: 13, // Default is 0 (Optional)
        },
        {
          type: EventStoreSubscriptionType.Volatile,
          stream: '$ce-user',
        },
        {
          type: EventStoreSubscriptionType.Persistent,
          stream: '$ce-user',
          persistentSubscriptionName: 'steamName',
          resolveLinkTos: true,  // Default is true (Optional)
        },
      ],
      eventHandlers: {
        UserLoggedInEvent: (data) => new UserLoggedInEvent(data),
        UserRegisteredEvent: (data) => new UserRegisteredEvent(data),
        EmailVerifiedEvent: (data) => new EmailVerifiedEvent(data),
      },
    }),
  ],
  
  providers: [
    UserSagas,
    ...UserQueryHandlers,
    ...UserCommandHandlers,
    ...UserEventHandlers,
  ],
})
export class UserModule {}
```

##### Setup async feature module
```typescript
import { Module } from '@nestjs/common';
import { EventStoreModule } from '@juicycleff/nestjs-event-store';
import { EventStoreFeatureService } from './user-eventstore-feature.service';

@Module({
  imports: [
    EventStoreModule.registerFeatureAsync({
      useClass: EventStoreFeatureService
    }),
  ]
})
export class AppModule {}
```

### Setup from versions below `v2.0.0`
#### Setup root app module

```typescript
import { Module } from '@nestjs/common';
import { NestjsEventStoreModule } from '@juicycleff/nestjs-event-store';

@Module({
  imports: [
    NestjsEventStoreModule.forRoot({
      http: {
        port: parseInt(process.env.ES_HTTP_PORT, 10),
        protocol: process.env.ES_HTTP_PROTOCOL,
      },
      tcp: {
        credentials: {
          password: process.env.ES_TCP_PASSWORD,
          username: process.env.ES_TCP_USERNAME,
        },
        hostname: process.env.ES_TCP_HOSTNAME,
        port: parseInt(process.env.ES_TCP_PORT, 10),
        protocol: process.env.ES_TCP_PROTOCOL,
      },
    }),
  ]
})
export class AppModule {}
```

#### Setup module

```typescript
import { Module } from '@nestjs/common';
import { CommandBus, CqrsModule, EventBus } from '@nestjs/cqrs';
import { NestjsEventStoreModule, EventStore } from '@juicycleff/nestjs-event-store';

import {
  UserCommandHandlers,
  UserCreatedEvent,
  UserEventHandlers,
  UserQueryHandlers,
} from '../cqrs';
import { UserSagas } from './sagas';

@Module({
  imports: [
    CqrsModule,
    NestjsEventStoreModule.forFeature({
      name: 'user',
      resolveLinkTos: false,
    }),
  ],
  
  providers: [
    UserSagas,
    ...UserQueryHandlers,
    ...UserCommandHandlers,
    ...UserEventHandlers,
  ],
})
export class UserModule {
  constructor(
    private readonly command$: CommandBus,
    private readonly event$: EventBus,
    private readonly eventStore: EventStore,
  ) {}

  onModuleInit(): any {
    this.eventStore.setEventHandlers(this.eventHandlers);
    this.eventStore.bridgeEventsTo((this.event$ as any).subject$);
    this.event$.publisher = this.eventStore;
  }

  eventHandlers = {
    UserCreatedEvent: (data) => new UserCreatedEvent(data),
  };
}
```


## Notice
 `2.0.0` release inspired by [nestjs-eventstore](https://github.com/daypaio/nestjs-eventstore)

## License

  This project is [MIT licensed](LICENSE).
