<h1 align="center">
NestJs Event Store
</h1>
  
<p align="center">
  NestJS CQRS module for EventStore.org. It requires @nestjs/cqrs.
</p>
    <p align="center">
</p>

<p align="center">
<a href="https://www.npmjs.com/package/nestjs-event-store" target="_blank"><img src="https://img.shields.io/npm/v/nestjs-event-store?style=flat-square" alt="NPM Version"/></a>
<a href="https://img.shields.io/github/license/juicycleff/nestjs-event-store?style=flat-square" target="_blank"><img src="https://img.shields.io/github/license/juicycleff/nestjs-event-store?style=flat-square" alt="License"/></a>
<a href="https://img.shields.io/github/languages/code-size/juicycleff/nestjs-event-store?style=flat-square" target="_blank"><img src="https://img.shields.io/github/languages/code-size/juicycleff/nestjs-event-store?style=flat-square" alt="Code Size"/></a>
<a href="https://img.shields.io/github/languages/top/juicycleff/nestjs-event-store?style=flat-square" target="_blank"><img src="https://img.shields.io/github/languages/top/juicycleff/nestjs-event-store?style=flat-square" alt="Top Language"/></a>
<a href="https://img.shields.io/codacy/grade/81314c5a5cb04baabe3eb5262b859288?style=flat-square" target="_blank"><img src="https://img.shields.io/codacy/grade/dc460840375d4ac995f5647a5ed10179?style=flat-square" alt="Top Language"/></a>
</p>

## Installation

```bash
$ yarn install nestjs-event-store
```

## Setup root app module

```typescript
import { Module } from '@nestjs/common';
import { NestjsEventStoreModule } from 'nestjs-event-store';

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

## Setup Gateway

```typescript
import { Module } from '@nestjs/common';
import { CommandBus, CqrsModule, EventBus } from '@nestjs/cqrs';
import { NestjsEventStoreModule } from 'nestjs-event-store/nestjs-event-store.module';
import { EventStore } from 'nestjs-event-store/event-store';

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
    private readonly authSagas: AuthSagas,
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

## License

  This project is [MIT licensed](LICENSE).
