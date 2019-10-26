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
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const external_context_creator_1 = require("@nestjs/core/helpers/external-context-creator");
const metadata_scanner_1 = require("@nestjs/core/metadata-scanner");
const params_factory_1 = require("@nestjs/graphql/dist/factories/params.factory");
const graphql_constants_1 = require("@nestjs/graphql/dist/graphql.constants");
const base_explorer_service_1 = require("@nestjs/graphql/dist/services/base-explorer.service");
const rxjs_1 = require("rxjs");
const tokens_1 = require("../tokens");
let ReferencesExplorerService = class ReferencesExplorerService extends base_explorer_service_1.BaseExplorerService {
    constructor(modulesContainer, metadataScanner, externalContextCreator, gqlOptions) {
        super();
        this.modulesContainer = modulesContainer;
        this.metadataScanner = metadataScanner;
        this.externalContextCreator = externalContextCreator;
        this.gqlOptions = gqlOptions;
        this.gqlParamsFactory = new params_factory_1.GqlParamsFactory();
    }
    explore() {
        const modules = this.getModules(this.modulesContainer, this.gqlOptions.include || []);
        const references = this.flatMap(modules, (wrapper, moduleRef) => {
            return wrapper.instance && this.filterReferences(wrapper, moduleRef);
        });
        return this.groupMetadata(references);
    }
    predicate(instance, prototype, methodName) {
        const callback = prototype[methodName];
        const isResolverReference = Reflect.getMetadata(tokens_1.RESOLVE_REFERENCE_METADATA, callback);
        if (!isResolverReference) {
            return null;
        }
        const resolverType = Reflect.getMetadata(graphql_constants_1.RESOLVER_TYPE_METADATA, callback) ||
            Reflect.getMetadata(graphql_constants_1.RESOLVER_TYPE_METADATA, instance.constructor);
        return {
            name: tokens_1.RESOLVE_REFERENCE_KEY,
            type: resolverType,
            methodName,
        };
    }
    filterReferences(wrapper, moduleRef) {
        const { instance } = wrapper;
        const prototype = Object.getPrototypeOf(instance);
        const resolvers = this.metadataScanner.scanFromPrototype(instance, prototype, (name) => this.predicate(instance, prototype, name));
        return resolvers
            .filter((resolver) => !!resolver)
            .map((resolver) => {
            const createContext = (transform) => {
                return this.createContextCallback(instance, prototype, wrapper, moduleRef, resolver, false, transform);
            };
            return Object.assign(Object.assign({}, resolver), { callback: createContext() });
        });
    }
    createContextCallback(instance, prototype, wrapper, moduleRef, resolver, isRequestScoped, transform = rxjs_1.identity) {
        return this.externalContextCreator.create(instance, prototype[resolver.methodName], resolver.methodName, graphql_constants_1.PARAM_ARGS_METADATA, this.gqlParamsFactory, undefined, undefined, undefined);
    }
};
ReferencesExplorerService = __decorate([
    common_1.Injectable(),
    __param(3, common_1.Inject(graphql_constants_1.GRAPHQL_MODULE_OPTIONS)),
    __metadata("design:paramtypes", [core_1.ModulesContainer,
        metadata_scanner_1.MetadataScanner,
        external_context_creator_1.ExternalContextCreator, Object])
], ReferencesExplorerService);
exports.ReferencesExplorerService = ReferencesExplorerService;
//# sourceMappingURL=references-explorer.service.js.map