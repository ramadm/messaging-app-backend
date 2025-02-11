require("dotenv").config();

const express = require("express");
const PORT = 3000;

const cors = require("cors");
const session = require("express-session");

// postgres session store
const pg = require("pg");
const pgStore = require("connect-pg-simple")(session);

const app = express();
const authRouter = require("./routes/auth");
const passport = require("passport");

app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(express.json());

app.use(
    session({
        secret: process.env.SESSION_COOKIE_SECRET,
        resave: false,
        saveUninitialized: false,
        store: new pgStore({
            pool: new pg.Pool({
                connectionString: process.env.DATABASE_URL,
            }),
        }),
        cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
    })
);
app.use(passport.authenticate("session"));

app.use("/", authRouter);

app.get("/messages", (req, res) => {
    console.log(req.body);
    if (req.isAuthenticated()) {
        res.send(["Testing"]);
    } else {
        res.sendStatus(400);
    }
});

app.listen(PORT, () => {
    console.log(`Messaging app is live at http://localhost:${PORT}`);
});
