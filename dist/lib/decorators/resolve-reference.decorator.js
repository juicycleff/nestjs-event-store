"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const tokens_1 = require("../tokens");
function ResolveReference() {
    return (target, key, descriptor) => {
        common_1.SetMetadata(tokens_1.RESOLVE_REFERENCE_METADATA, true)(target, key, descriptor);
    };
}
exports.ResolveReference = ResolveReference;
//# sourceMappingURL=resolve-reference.decorator.js.map