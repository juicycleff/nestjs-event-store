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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const federation_1 = require("@apollo/federation");
const common_1 = require("@nestjs/common");
const resolvers_explorer_service_1 = require("@nestjs/graphql/dist/services/resolvers-explorer.service");
const scalars_explorer_service_1 = require("@nestjs/graphql/dist/services/scalars-explorer.service");
const extend_util_1 = require("@nestjs/graphql/dist/utils/extend.util");
const remove_temp_util_1 = require("@nestjs/graphql/dist/utils/remove-temp.util");
const apollo_server_express_1 = require("apollo-server-express");
const services_1 = require("./services");
let GraphqlDistributedFactory = class GraphqlDistributedFactory {
    constructor(resolversExplorerService, scalarsExplorerService, referencesExplorerService) {
        this.resolversExplorerService = resolversExplorerService;
        this.scalarsExplorerService = scalarsExplorerService;
        this.referencesExplorerService = referencesExplorerService;
    }
    mergeOptions(options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const resolvers = this.extendResolvers([
                this.resolversExplorerService.explore(),
                this.scalarsExplorerService.explore(),
                this.referencesExplorerService.explore(),
            ]);
            const federatedSchema = federation_1.buildFederatedSchema([
                {
                    typeDefs: apollo_server_express_1.gql `${options.typeDefs}`,
                    resolvers,
                },
            ]);
            remove_temp_util_1.removeTempField(federatedSchema);
            return Object.assign(Object.assign({}, options), { typeDefs: undefined, schema: federatedSchema });
        });
    }
    extendResolvers(resolvers) {
        return resolvers.reduce((prev, curr) => extend_util_1.extend(prev, curr), {});
    }
};
GraphqlDistributedFactory = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [resolvers_explorer_service_1.ResolversExplorerService,
        scalars_explorer_service_1.ScalarsExplorerService,
        services_1.ReferencesExplorerService])
], GraphqlDistributedFactory);
exports.GraphqlDistributedFactory = GraphqlDistributedFactory;
//# sourceMappingURL=graphql-distributed.factory.js.map