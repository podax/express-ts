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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAd = exports.list = void 0;
const ad_model_1 = __importDefault(require("./ad.model"));
const list = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ads = yield ad_model_1.default.paginate({}, {
            page: 1,
            limit: 10,
        });
        if (!!ads) {
            res.json({ success: true, data: { ads } });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error });
    }
});
exports.list = list;
const createAd = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // if (!req.file) {
    //   return res.status(400).send("No file uploaded.");
    // }
    // res.status(200).send(`File uploaded: ${req.file.filename}`);
    // try {
    //   const ad = await Ad.create(req.body);
    //   if (!!ad) {
    //     res.json({ success: true, data: { ad } });
    //   }
    // } catch (error) {
    //   console.log(error);
    //   res.status(500).json({ success: false, error });
    // }
    res.json({ files: req.files, body: req.body });
});
exports.createAd = createAd;
