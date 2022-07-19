var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var EventStoreModule_1;
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EventStoreCoreModule } from './event-store-core.module';
let EventStoreModule = EventStoreModule_1 = class EventStoreModule {
    static register(option) {
        return {
            module: EventStoreModule_1,
            imports: [EventStoreCoreModule.register(option)]
        };
    }
    static registerAsync(option) {
        return {
            module: EventStoreModule_1,
            imports: [EventStoreCoreModule.registerAsync(option)]
        };
    }
    static registerFeature(config) {
        return {
            module: EventStoreModule_1,
            imports: [EventStoreCoreModule.registerFeature(config)]
        };
    }
    static registerFeatureAsync(options) {
        return {
            module: EventStoreModule_1,
            imports: [EventStoreCoreModule.registerFeatureAsync(options)]
        };
    }
};
EventStoreModule = EventStoreModule_1 = __decorate([
    Module({
        imports: [CqrsModule]
    })
], EventStoreModule);
export { EventStoreModule };
//# sourceMappingURL=event-store.module.js.map