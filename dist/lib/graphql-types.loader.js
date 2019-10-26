"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const glob = __importStar(require("fast-glob"));
const fs = __importStar(require("fs"));
const lodash_1 = require("lodash");
const merge_graphql_schemas_1 = require("merge-graphql-schemas");
const util = __importStar(require("util"));
const readFile = util.promisify(fs.readFile);
let GraphQLTypesLoader = class GraphQLTypesLoader {
    mergeTypesByPaths(paths) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!paths || paths.length === 0) {
                return null;
            }
            const types = yield this.getTypesFromPaths(paths);
            const flatTypes = lodash_1.flatten(types);
            const tempType = 'type Query { temp__: Boolean }';
            return merge_graphql_schemas_1.mergeTypes([...flatTypes, tempType], { all: true });
        });
    }
    getTypesFromPaths(paths) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePaths = yield glob.sync(paths, {
                ignore: ['node_modules'],
            });
            const fileContentsPromises = filePaths.map((filePath) => {
                return readFile(filePath.toString(), 'utf8');
            });
            return Promise.all(fileContentsPromises);
        });
    }
};
GraphQLTypesLoader = __decorate([
    common_1.Injectable()
], GraphQLTypesLoader);
exports.GraphQLTypesLoader = GraphQLTypesLoader;
//# sourceMappingURL=graphql-types.loader.js.map