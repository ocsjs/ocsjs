"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoUpdate = void 0;
var axios_1 = require("./updater/axios");
// import { AutoUpdater } from './updater/auto.updater';
// AutoUpdater.checkUpdate()
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var rest_1 = require("@octokit/rest");
var compressing_1 = __importDefault(require("compressing"));
var electron_log_1 = require("electron-log");
var rest = new rest_1.Octokit( /*{ auth: `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` }*/).rest;
var owner = 'enncy';
var repo = 'online-course-script';
// Compare: https://docs.github.com/en/rest/reference/repos/#list-organization-repositories
function AutoUpdate() {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var res, data, asset_id, asset, zip, _path_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    (0, electron_log_1.log)("自动更新中...");
                    return [4 /*yield*/, rest.repos.getLatestRelease({
                            owner: owner,
                            repo: repo,
                        })];
                case 1:
                    res = _b.sent();
                    return [4 /*yield*/, rest.repos.listReleaseAssets({
                            owner: owner,
                            repo: repo,
                            release_id: res.data.id
                        })];
                case 2:
                    data = (_b.sent()).data;
                    (0, electron_log_1.log)("下载压缩包...");
                    asset_id = (_a = data.find(function (a) { return a.name === 'ocs-app-resources.zip'; })) === null || _a === void 0 ? void 0 : _a.id;
                    if (!asset_id) return [3 /*break*/, 5];
                    return [4 /*yield*/, rest.repos.getReleaseAsset({
                            owner: owner,
                            repo: repo,
                            asset_id: asset_id,
                        })];
                case 3:
                    asset = _b.sent();
                    return [4 /*yield*/, (0, axios_1.AxiosGet)({
                            url: asset.data.browser_download_url,
                            responseType: 'stream'
                        })];
                case 4:
                    zip = _b.sent();
                    _path_1 = path_1.default.resolve('./resources/resource.zip');
                    (0, electron_log_1.log)("_path", _path_1);
                    zip.data.pipe(fs_1.default.createWriteStream(_path_1))
                        .on("close", function () {
                        (0, electron_log_1.log)("下载完成");
                        fs_1.default.rmSync(path_1.default.resolve('./resources/app/'), { recursive: true, force: true });
                        compressing_1.default.zip.uncompress(_path_1, path_1.default.resolve('./resources/app'))
                            .then(function () {
                            (0, electron_log_1.log)('success');
                        })
                            .catch(function (err) {
                            console.error(err);
                        });
                    });
                    _b.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.AutoUpdate = AutoUpdate;
