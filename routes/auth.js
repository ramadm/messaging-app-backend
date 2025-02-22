const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const queries = require("../queries");

const saltRounds = 10;

// Use a local login strategy, i.e. name + password
passport.use(
    new LocalStrategy(async function verify(username, password, cb) {
        try {
            const user = await queries.getUserByUsername(username);
            if (!user) {
                return cb(null, false, {
                    message: "Incorrect username or password.",
                });
            }
            bcrypt.compare(password, user.password, function (err, result) {
                if (err) {
                    return cb(err);
                }
                if (!result) {
                    return cb(null, false, {
                        message: "Incorrect username or password.",
                    });
                }
                return cb(null, user);
            });
        } catch (err) {
            return cb(err);
        }
    })
);

passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, { id: user.id, username: user.username });
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        await queries.createUser(req.body.username, hashedPassword);
        console.log(`User created: ${req.body.username}`);
        res.send({
            message: "Success",
        });
    } catch {
        res.sendStatus(403);
    }
});

router.post(
    "/login/password",
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureMessage: true,
    }),
    function (req, res) {
        res.send({
            id: req.user.id,
            username: req.user.username,
        });
    }
);

router.post("/session", (req, res) => {
    if (!req.user) {
        return res.sendStatus(403);
    }
    res.send({
        id: req.user.id,
        username: req.user.username,
    });
});

router.post("/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            console.log(err);
            return next(err);
        }
        res.sendStatus(200);
    });
});

module.exports = router;
