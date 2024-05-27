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
const multer_1 = __importDefault(require("multer"));
dotenv_1.default.config();
const client = new pg_1.Client({
    connectionString: process.env.PGURI,
});
client.connect();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    },
});
const upload = (0, multer_1.default)({ storage: storage });
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
        const userExists = yield client.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const queryText = `
      INSERT INTO users (username, password)
      VALUES ($1, $2)
      RETURNING *;
    `;
        const values = [username, hashedPassword];
        const newUser = yield client.query(queryText, values);
        console.log('Register response:', newUser.rows[0]);
        // Check if JWT_SECRET is defined
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }
        // Generate a JWT token for the new user
        const token = jsonwebtoken_1.default.sign({ id: newUser.rows[0].id, username: newUser.rows[0].username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        // Send the new user data along with the token
        res.json({ user: newUser.rows[0], token });
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
app.post('/api/recommended', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userChoices = req.body;
        let bestMatches = [];
        let bestScore = -1;
        const destinations = yield client.query('SELECT * FROM recommended');
        for (const destination of destinations.rows) {
            if (destination.continent !== userChoices.continent) {
                continue;
            }
            let score = 0;
            for (const choice in userChoices) {
                if (destination[choice] === userChoices[choice]) {
                    score++;
                }
            }
            if (score > bestScore) {
                bestMatches = [destination];
                bestScore = score;
            }
            else if (score === bestScore) {
                bestMatches.push(destination);
            }
        }
        if (bestMatches.length > 0) {
            // Select a random destination from the best matches
            const randomIndex = Math.floor(Math.random() * bestMatches.length);
            res.json(bestMatches[randomIndex]);
        }
        else {
            res.status(404).json({ error: 'No matching destination found' });
        }
    }
    catch (error) {
        console.error('Error finding best match:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
app.post('/api/saveBlogPost', upload.single('image'), jwtMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postData = req.body;
        if (!postData || !postData.title || !postData.description || !req.file) {
            console.error('Invalid blog post data:', postData, 'req.file:', req.file);
            return res.status(400).json({ error: 'Invalid blog post data' });
        }
        const imagePath = req.file.path; // Get the path to the image file
        const queryText = `
      INSERT INTO blog_posts (title, description, image, user_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
        const values = [
            postData.title,
            postData.description,
            imagePath,
            req.user.id,
        ]; // Store the image path in the database
        const result = yield client.query(queryText, values);
        if (result.rows && result.rows.length > 0) {
            res.json(result.rows[0]);
        }
        else {
            throw new Error('Insert operation did not return any rows');
        }
    }
    catch (error) {
        console.error('Error saving blog post:', error);
        console.error('Request body:', req.body);
        console.error('File:', req.file);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
app.get('/api/blogPosts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const queryText = 'SELECT * FROM blog_posts';
        const blogPostsResult = yield client.query(queryText);
        const blogPosts = blogPostsResult.rows;
        for (let post of blogPosts) {
            const commentResult = yield client.query('SELECT comments.*, users.username FROM comments INNER JOIN users ON comments.user_id = users.id WHERE post_id = $1', [post.id]);
            post.comments = commentResult.rows;
            for (let comment of post.comments) {
                const replyResult = yield client.query('SELECT replies.*, users.username FROM replies INNER JOIN users ON replies.user_id = users.id WHERE comment_id = $1', [comment.id]);
                console.log('Reply Result:', replyResult); // Log the result of the query
                comment.replies = replyResult.rows;
                console.log('heeeej:', comment);
            }
        }
        res.json(blogPosts); // Send the blog posts with comments and replies back as a JSON response
        console.log('Blog posts:', blogPosts);
    }
    catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: 'An error occurred while fetching blog posts' });
    }
}));
app.post('/api/comments', jwtMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { content, post_id } = req.body;
    const user_id = req.user.id;
    try {
        const result = yield client.query(`INSERT INTO comments (content, post_id, user_id) VALUES ($1, $2, $3)
       RETURNING *, (SELECT username FROM users WHERE id = $3) as username`, [content, post_id, user_id]);
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ error: 'An error occurred while creating the comment' });
    }
}));
app.post('/api/replies', jwtMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { content, comment_id, parent_id } = req.body;
    const user_id = req.user.id;
    try {
        // Check if the comment exists
        const commentResult = yield client.query('SELECT * FROM comments WHERE id = $1', [comment_id]);
        if (commentResult.rows.length === 0) {
            return res.status(400).json({
                error: 'The comment you are trying to reply to does not exist',
            });
        }
        const result = yield client.query('INSERT INTO replies (content, comment_id, user_id, parent_id) VALUES ($1, $2, $3, $4) RETURNING *, (SELECT username FROM users WHERE id = $3) as username', [content, comment_id, user_id, parent_id]);
        console.log('hehhehee', result);
        result.rows[0].content = result.rows[0].content.replace(/\\n/g, '\n');
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error('Error message:', err.message);
        console.error('Stack trace:', err.stack);
        res
            .status(500)
            .json({ error: 'An error occurred while creating the reply' });
    }
}));
app.post('/api/tripDetails', jwtMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tripName, tripDescription } = req.body;
    const user_id = req.user.id;
    const modifiedTripDescription = tripDescription.replace(/\n/g, '\\n');
    console.log('Received tripDescription:', tripDescription);
    try {
        // Insert the trip name, trip description, and user_id into the trip_details table
        const result = yield client.query('INSERT INTO trip_details (tripname, description, user_id) VALUES ($1, $2, $3) RETURNING *', [tripName, modifiedTripDescription, user_id]);
        res.json(result.rows[0]);
        console.log('Trip details:', result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while creating the trip' });
    }
}));
app.get('/api/userTrips', jwtMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = req.user.id;
    try {
        const result = yield client.query('SELECT * FROM trip_details WHERE user_id = $1 ORDER BY id DESC', [user_id]);
        res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ error: 'An error occurred while fetching the trip details' });
    }
}));
app.get('/api/tripDetails/:tripId', jwtMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tripId } = req.params;
    try {
        const result = yield client.query('SELECT * FROM trip_details WHERE id = $1', [tripId]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        }
        else {
            res.status(404).json({ error: 'Trip not found' });
        }
    }
    catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ error: 'An error occurred while fetching the trip details' });
    }
}));
app.get('/api/trips/:tripId', jwtMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tripId } = req.params;
    const user_Id = req.user.id;
    try {
        // Fetch trip from the database by tripId and userId
        const trip = yield client.query('SELECT * FROM trip_details WHERE id = $1 AND user_id = $2', [tripId, user_Id]);
        if (trip.rows.length > 0) {
            // Send the trip data as a response
            res.json(trip.rows[0]);
            console.log(trip.rows[0]);
        }
        else {
            console.log(`Trip with ID ${tripId} not found or user ${user_Id} does not have access to it`);
            res.status(404).json({ message: 'Trip not found' });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
app.post('/api/activities/:tripId', jwtMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { date, description } = req.body;
    const tripId = req.params.tripId;
    const userId = req.user.id;
    try {
        const result = yield client.query('INSERT INTO activities (trip_id, activity, date, user_id) VALUES ($1, $2, $3, $4) RETURNING *', [tripId, description, date, userId]);
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json({ error: 'Error adding activity' });
    }
}));
app.put('/api/trips/:tripId/dates', jwtMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tripId } = req.params;
    const userId = req.user.id;
    const { startDate, endDate } = req.body;
    try {
        const trip = yield client.query('UPDATE trip_details SET start_date = $1, end_date = $2 WHERE id = $3 AND user_id = $4 RETURNING *', [startDate, endDate, tripId, userId]);
        if (trip.rows.length > 0) {
            res.json(trip.rows[0]);
        }
        else {
            res.status(404).json({ message: 'Trip not found' });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
app.get('/api/activities/:tripId', jwtMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tripId = req.params.tripId;
    const userId = req.user.id;
    try {
        const result = yield client.query('SELECT * FROM activities WHERE trip_id = $1 AND user_id = $2 ORDER BY date', [tripId, userId]);
        res.status(200).json(result.rows);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching activities' });
    }
}));
app.delete('/api/activities/:tripId/:activityId', jwtMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tripId = req.params.tripId;
    const activityId = req.params.activityId;
    const userId = req.user.id;
    try {
        yield client.query('DELETE FROM activities WHERE id = $1 AND trip_id = $2 AND user_id = $3', [activityId, tripId, userId]);
        res.status(200).json({ message: 'Activity deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error deleting activity' });
    }
}));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
app.use(express_1.default.static(path_1.default.join(path_1.default.resolve(), 'public')));
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(path_1.default.resolve(), 'public', 'index.html'));
});
app.listen(3000, () => {
    console.log('Webbtjänsten kan nu ta emot anrop.');
});
