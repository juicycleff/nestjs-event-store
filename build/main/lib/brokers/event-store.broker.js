"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventStoreBroker = void 0;
const common_1 = require("@nestjs/common");
const assert_1 = __importDefault(require("assert"));
const uuid = __importStar(require("uuid"));
const node_eventstore_client_1 = require("node-eventstore-client");
class EventStoreBroker {
    constructor() {
        this.logger = new common_1.Logger(this.constructor.name);
        this.type = 'event-store';
    }
    connect(options, endpoint) {
        try {
            this.client = (0, node_eventstore_client_1.createConnection)(options, endpoint);
            this.client.connect();
            this.client.on('connected', () => {
                this.isConnected = true;
                this.logger.log('EventStore connected!');
            });
            this.client.on('closed', () => {
                this.isConnected = false;
                this.logger.error('EventStore closed!');
                this.connect(options, endpoint);
            });
            return this;
        }
        catch (e) {
            this.logger.error(e);
            throw new Error(e);
        }
    }
    getClient() {
        return this.client;
    }
    newEvent(name, payload) {
        return this.newEventBuilder(name, payload);
    }
    newEventBuilder(eventType, data, metadata, eventId) {
        (0, assert_1.default)(eventType);
        (0, assert_1.default)(data);
        const event = {
            eventId: eventId || uuid.v4(),
            eventType,
            data
        };
        if (metadata !== undefined) {
            event.metadata = metadata;
        }
        return event;
    }
    close() {
        this.client.close();
        return this;
    }
}
exports.EventStoreBroker = EventStoreBroker;
//# sourceMappingURL=event-store.broker.js.map