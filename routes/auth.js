const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { BCRYPT_WORK_FACTOR, SECRET_KEY, DB_URI } = require("../config");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const bcrypt = require("bcrypt");
const ExpressError = require("../expressError");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            throw new ExpressError("Username and password required", 400);
        }
        const isValid = await User.authenticate(username, password);
        if (isValid) {
            const token = jwt.sign({ username }, SECRET_KEY);
            return res.json({ message: "logged in!", token });
        }

        // OLDER VERSION OF LOGIC FROM EXERCISE
        // DELETE AFTER THE REFOCTORING WORKS
        //  const results = await db.quiry(
        //       `SELECT username, password
        //       FROM users
        //       WHERE username = $1`,
        //       [username]);
        //   const user = results.rows[0];
        //   if (user) {
        //       if (await bcrypt.compare(password, user.password)) {
        //           const token = jwt.sign(SECRET_KEY);
        //           return res.json({ message: `logged in!`, token });
        //       }
        //   }

        throw new ExpressError("Invalid Username/password", 400);

    } catch (e) {
        return next(new ExpressError(`Error Logging in: ${e}`, 400));
    }
});


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post('/register', async (req, res, next) => {
    try {
        const { username, password, first_name, last_name, phone } = req.body;
        if (!username || !password || !first_name || !last_name || !phone) {
            throw new ExpressError("All Data fields required", 400);
        }
        const newUser = await User.register({ username, password, first_name, last_name, phone });

        if (newUser) {
            const token = jwt.sign({ username: newUser.username }, SECRET_KEY);
            return res.json({ message: `registered and logged in!`, token, user: newUser });
        }
        throw new ExpressError("Registration failed", 400);
    } catch (e) {
        return next(e);
    }
});

module.exports = router;