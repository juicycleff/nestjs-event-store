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
exports.NatsEventStoreBroker = void 0;
const common_1 = require("@nestjs/common");
const assert_1 = __importDefault(require("assert"));
const uuid = __importStar(require("uuid"));
const node_nats_streaming_1 = require("node-nats-streaming");
class NatsEventStoreBroker {
    constructor() {
        this.logger = new common_1.Logger(this.constructor.name);
        this.type = 'nats';
        this.clientId = uuid.v4();
    }
    connect(clusterId, clientId, options) {
        try {
            if (clientId) {
                this.clientId = clientId;
            }
            this.client = (0, node_nats_streaming_1.connect)(clusterId, this.clientId, options);
            this.client.on('connect', () => {
                this.isConnected = true;
                this.logger.log('Nats Streaming EventStore connected!');
            });
            this.client.on('disconnect:', () => {
                this.isConnected = false;
                this.logger.error('Nats Streaming EventStore disconnected!');
                this.connect(clusterId, this.clientId, options);
            });
            this.client.on('close:', () => {
                this.isConnected = false;
                this.logger.error('Nats Streaming EventStore closed!');
                this.connect(clusterId, this.clientId, options);
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
exports.NatsEventStoreBroker = NatsEventStoreBroker;
//# sourceMappingURL=nats-event-store.broker.js.map