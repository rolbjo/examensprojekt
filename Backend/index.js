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
app.get('/data/destinations', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query } = req.query;
        let queryText = 'SELECT * FROM destinations';
        if (query) {
            queryText += ` WHERE name ILIKE '%${query}%'`;
        }
        const data = yield client.query(queryText);
        res.json(data.rows);
    }
    catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
app.get('/data/:destination', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { destination } = req.params;
        console.log('Destination Parameter:', destination);
        console.log('Destination Parameter:', destination, typeof destination);
        const data = yield client.query('SELECT * FROM destinations WHERE name = $1', [destination]);
        res.json(data.rows);
    }
    catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
app.use(express_1.default.static(path_1.default.join(path_1.default.resolve(), 'public')));
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(path_1.default.resolve(), 'public', 'index.html'));
});
app.listen(3000, () => {
    console.log('Webbtjänsten kan nu ta emot anrop.');
});
