var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var EventStoreCoreModule_1;
import { Global, Module } from '@nestjs/common';
import { NEST_EVENTSTORE_FEATURE_OPTION, NEST_EVENTSTORE_OPTION, ProvidersConstants } from './contract';
import { EventStore, NatsEventStore } from './stores';
import { EventStoreBroker, NatsEventStoreBroker } from './brokers';
import { CqrsModule } from '@nestjs/cqrs';
let EventStoreCoreModule = EventStoreCoreModule_1 = class EventStoreCoreModule {
    static register(option) {
        const eventStoreProviders = {
            provide: ProvidersConstants.EVENT_STORE_PROVIDER,
            useFactory: () => {
                switch (option.type) {
                    case 'event-store':
                        return new EventStoreBroker();
                    case 'nats':
                        return new NatsEventStoreBroker();
                    default:
                        throw new Error('event store broker type missing');
                }
            }
        };
        const configProv = {
            provide: ProvidersConstants.EVENT_STORE_CONNECTION_CONFIG_PROVIDER,
            useValue: {
                ...option
            }
        };
        return {
            module: EventStoreCoreModule_1,
            providers: [eventStoreProviders, configProv],
            exports: [eventStoreProviders, configProv]
        };
    }
    static registerAsync(options) {
        const eventStoreProviders = {
            provide: ProvidersConstants.EVENT_STORE_PROVIDER,
            useFactory: () => {
                switch (options.type) {
                    case 'event-store':
                        return new EventStoreBroker();
                    case 'nats':
                        return new NatsEventStoreBroker();
                    default:
                        throw new Error('event store broker type missing');
                }
            }
        };
        const configProv = {
            provide: ProvidersConstants.EVENT_STORE_CONNECTION_CONFIG_PROVIDER,
            useFactory: async (esOptions) => {
                return {
                    ...esOptions
                };
            },
            inject: [NEST_EVENTSTORE_OPTION]
        };
        const asyncProviders = this.createAsyncProviders(options);
        return {
            module: EventStoreCoreModule_1,
            imports: options.imports,
            providers: [...asyncProviders, eventStoreProviders, configProv],
            exports: [eventStoreProviders, configProv]
        };
    }
    static registerFeature(config) {
        if (config === undefined || config === null) {
            throw new Error('Config missing');
        }
        const CurrentStore = config.type === 'event-store' ? EventStore : NatsEventStore;
        return {
            module: EventStoreCoreModule_1,
            providers: [
                {
                    provide: ProvidersConstants.EVENT_STORE_STREAM_CONFIG_PROVIDER,
                    useValue: {
                        ...config
                    }
                },
                CurrentStore
            ],
            exports: [CurrentStore]
        };
    }
    static registerFeatureAsync(options) {
        const configProv = {
            provide: ProvidersConstants.EVENT_STORE_STREAM_CONFIG_PROVIDER,
            useFactory: async (config) => {
                return {
                    ...config
                };
            },
            inject: [NEST_EVENTSTORE_FEATURE_OPTION]
        };
        const asyncProviders = this.createFeatureAsyncProviders(options);
        const CurrentStore = options.type === 'event-store' ? EventStore : NatsEventStore;
        return {
            module: EventStoreCoreModule_1,
            providers: [...asyncProviders, configProv, CurrentStore],
            exports: [CurrentStore]
        };
    }
    static createAsyncProviders(options) {
        if (options.useExisting || options.useFactory) {
            return [this.createAsyncOptionsProvider(options)];
        }
        const useClass = options.useClass;
        return [
            this.createAsyncOptionsProvider(options),
            {
                provide: useClass,
                useClass
            }
        ];
    }
    static createAsyncOptionsProvider(options) {
        if (options.useFactory) {
            return {
                provide: NEST_EVENTSTORE_OPTION,
                useFactory: options.useFactory,
                inject: options.inject || []
            };
        }
        const inject = [
            (options.useClass || options.useExisting)
        ];
        return {
            provide: NEST_EVENTSTORE_OPTION,
            useFactory: async (optionsFactory) => await optionsFactory.createEventStoreOptions(options.name),
            inject
        };
    }
    static createFeatureAsyncProviders(options) {
        if (options.useExisting || options.useFactory) {
            return [this.createFeatureAsyncOptionsProvider(options)];
        }
        const useClass = options.useClass;
        return [
            this.createFeatureAsyncOptionsProvider(options),
            {
                provide: useClass,
                useClass
            }
        ];
    }
    static createFeatureAsyncOptionsProvider(options) {
        if (options.useFactory) {
            return {
                provide: NEST_EVENTSTORE_FEATURE_OPTION,
                useFactory: options.useFactory,
                inject: options.inject || []
            };
        }
        const inject = [
            (options.useClass || options.useExisting)
        ];
        return {
            provide: NEST_EVENTSTORE_FEATURE_OPTION,
            useFactory: async (optionsFactory) => await optionsFactory.createFeatureOptions(options.name),
            inject
        };
    }
};
EventStoreCoreModule = EventStoreCoreModule_1 = __decorate([
    Global(),
    Module({
        imports: [CqrsModule]
    })
], EventStoreCoreModule);
export { EventStoreCoreModule };
//# sourceMappingURL=event-store-core.module.js.map