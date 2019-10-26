"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var GraphqlDistributedGatewayModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
const gateway_1 = require("@apollo/gateway");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const apollo_server_express_1 = require("apollo-server-express");
const tokens_1 = require("./tokens");
let GraphqlDistributedGatewayModule = GraphqlDistributedGatewayModule_1 = class GraphqlDistributedGatewayModule {
    constructor(httpAdapterHost, options) {
        this.httpAdapterHost = httpAdapterHost;
        this.options = options;
    }
    static forRoot(options) {
        return {
            module: GraphqlDistributedGatewayModule_1,
            providers: [
                {
                    provide: tokens_1.DISTRIBUTED_GATEWAY_OPTIONS,
                    useValue: options,
                },
            ],
        };
    }
    onModuleInit() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.httpAdapterHost) {
                return;
            }
            const { httpAdapter } = this.httpAdapterHost;
            if (!httpAdapter) {
                return;
            }
            const app = httpAdapter.getInstance();
            const _a = this.options, { __exposeQueryPlanExperimental, debug, serviceList, path, disableHealthCheck, onHealthCheck, cors, bodyParserConfig, installSubscriptionHandlers, buildService } = _a, rest = __rest(_a, ["__exposeQueryPlanExperimental", "debug", "serviceList", "path", "disableHealthCheck", "onHealthCheck", "cors", "bodyParserConfig", "installSubscriptionHandlers", "buildService"]);
            const gateway = new gateway_1.ApolloGateway({
                __exposeQueryPlanExperimental,
                debug,
                serviceList,
                buildService,
            });
            this.apolloServer = new apollo_server_express_1.ApolloServer(Object.assign({ gateway }, rest));
            this.apolloServer.applyMiddleware({
                app,
                path,
                disableHealthCheck,
                onHealthCheck,
                cors,
                bodyParserConfig,
            });
            if (installSubscriptionHandlers) {
                this.apolloServer.installSubscriptionHandlers(httpAdapter.getHttpServer());
            }
        });
    }
};
GraphqlDistributedGatewayModule = GraphqlDistributedGatewayModule_1 = __decorate([
    common_1.Module({}),
    __param(0, common_1.Optional()),
    __param(1, common_1.Inject(tokens_1.DISTRIBUTED_GATEWAY_OPTIONS)),
    __metadata("design:paramtypes", [core_1.HttpAdapterHost, Object])
], GraphqlDistributedGatewayModule);
exports.GraphqlDistributedGatewayModule = GraphqlDistributedGatewayModule;
//# sourceMappingURL=nestjs-graphql-distributed-gateway.module.js.map