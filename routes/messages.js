const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Message = require("../models/message");
const ExpressError = require("../expressError");
const { ensureCorrectUser, ensureLoggedIn, authenticateJWT } = require("../middleware/auth");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", authenticateJWT, ensureCorrectUser, async (req, res, next) => {
    try {
        const message = await Message.get(req.params.id);
        return res.json({ message });
    } catch (e) {
        return next(new ExpressError("Message not found", 404));
    }
});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", async (req, res, next) => {
    try {
        const { from_username, to_username, body } = req.body;
        console.log(req.body);
        if (!from_username || !to_username || !body) {
            throw new ExpressError("All fields required", 400);
        }

        const message = await Message.create({ from_username, to_username, body });
        return res.json({ message });

    } catch (e) {
        return next(new ExpressError(`Couldn't create message: ${e}`, 400));
    }
});


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read", async (req, res, next) => {
    try {
        const message = await Message.markRead(req.params.id);
        return res.json({ message });


    } catch (e) {
        return next(new ExpressError(""))
    }
});


module.exports = router;