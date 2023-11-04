// Import the packages.
import express from 'express';
import morgan from 'morgan';
import { engine } from 'express-handlebars';
import {v4 as uuidv4} from 'uuid';
import { EventSource } from "express-ts-sse";

// Default to 3000 if PORT env is not set.
const port = process.env.PORT || 3000;

// Create an instance of SSE
const sse = new EventSource();

// Create an instance of the application.
const app = express();

// Configure render engine.
app.engine('html', engine({defaultLayout: false}));
app.set("view engine", "html");

// Log incoming requests.
app.use(morgan('combined'));

// POST /chess.
app.post("/chess", express.urlencoded({extended: true}), (req, res) => {
    const gameId = uuidv4().substring(0, 8);
    const orientation = "white";

    res.status(200).render("chess", {gameId, orientation});
});

// GET /chess?gameId=abc123
app.get("/chess", (req, res) => {
    const gameId = req.query.gameId;
    const orientation = "black";

    res.status(200).render("chess", {gameId, orientation});
});

// PATCH /chess/:gameId
app.patch("/chess/:gameId", express.json(),(req, res) => {
    // Get the gameId from the resource.
    const gameId = req.params.gameId;
    const move = req.body;

    console.info(`GameId: ${gameId}: `, move);
    
    sse.send({event: gameId, data: move});

    res.status(201).json({ timestamp: (new Date().getTime())})
});

// GET /chess/stream
app.get("/chess/stream", sse.init);

// Serve files from static.
app.use(express.static(import.meta.dir + '/static'));

// Start express.
app.listen(port, () => {
    console.log(`Application bound to port ${port} at ${new Date()}`);
});