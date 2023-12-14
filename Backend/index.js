"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const pg_1 = require("pg");
dotenv_1.default.config();
const client = new pg_1.Client({
    connectionString: process.env.PGURI,
});
client.connect();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.get('/data', (request, response) => {
    response.send('Hello Wefepfsergokerorld!');
});
app.use(express_1.default.static(path_1.default.join(path_1.default.resolve(), 'public')));
app.listen(3000, () => {
    console.log('Webbtjänsten kan nu ta emot anrop.');
});
