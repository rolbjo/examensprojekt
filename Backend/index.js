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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const client = new pg_1.Client({
    connectionString: process.env.PGURI,
});
client.connect();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const jwtMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    }
    else {
        res.sendStatus(401);
    }
};
app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Register request:', req.body);
    try {
        const { username, password } = req.body;
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const queryText = `
      INSERT INTO users (username, password)
      VALUES ($1, $2)
      RETURNING *;
    `;
        const values = [username, hashedPassword];
        const newUser = yield client.query(queryText, values);
        console.log('Register response:', newUser.rows[0]);
        res.json(newUser.rows[0]);
    }
    catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const queryText = 'SELECT * FROM users WHERE username = $1';
        const values = [username];
        const user = yield client.query(queryText, values);
        if (user.rows.length > 0) {
            const passwordMatch = yield bcrypt_1.default.compare(password, user.rows[0].password);
            if (passwordMatch) {
                if (!process.env.JWT_SECRET) {
                    throw new Error('JWT_SECRET is not defined');
                }
                const token = jsonwebtoken_1.default.sign({ id: user.rows[0].id, username: user.rows[0].username }, process.env.JWT_SECRET, { expiresIn: '1h' });
                console.log('Login response:', 'Logged in', token);
                res.json({ message: 'Logged in', token });
            }
            else {
                res.status(401).json({ error: 'Incorrect password' });
            }
        }
        else {
            res.status(404).json({ error: 'User not found' });
        }
    }
    catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
app.get('/data/destinations', jwtMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Headers:', req.headers);
    try {
        const { query } = req.query;
        let queryText = 'SELECT * FROM destinations';
        if (query) {
            queryText += ` WHERE name ILIKE '%${query}%'`;
        }
        const data = yield client.query(queryText);
        console.log('Response data:', data);
        res.json(data.rows);
    }
    catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
app.get('/data/:destination', jwtMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { destination } = req.params;
        const data = yield client.query('SELECT * FROM destinations WHERE name = $1', [destination]);
        res.json(data.rows);
    }
    catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
app.get('/trips', jwtMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield client.query('SELECT * FROM trips WHERE user_id = $1', [req.user.id]);
        const trips = result.rows;
        res.json(trips);
    }
    catch (error) {
        console.error('Error fetching saved trips:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
app.post('/data/saveTrip', jwtMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tripData = req.body;
        console.log('Received trip data:', tripData);
        if (!tripData ||
            !tripData.destination ||
            !tripData.startDate ||
            !tripData.endDate) {
            return res.status(400).json({ error: 'Invalid trip data' });
        }
        if (!req.user || !req.user.id) {
            console.error('Invalid user data:', req.user);
            return res.status(400).json({ error: 'Invalid user data' });
        }
        const queryText = `
        INSERT INTO trips (destination, start_date, end_date, user_id)
        VALUES ($1, TO_DATE($2, 'YYYY-MM-DD'), TO_DATE($3, 'YYYY-MM-DD'),$4)
        RETURNING *;
      `;
        const values = [
            tripData.destination,
            tripData.startDate,
            tripData.endDate,
            req.user.id,
        ];
        const savedTrip = yield client.query(queryText, values);
        res.json(savedTrip.rows[0]);
    }
    catch (error) {
        console.error('Error saving trip:', error);
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
