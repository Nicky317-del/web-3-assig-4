const express = require("express");
const mongoose = require("mongoose");

const { noteModel } = require("../model/note.model");
const { auth } = require("../middleware/auth.middlewere");

const noteRouter = express.Router();

// CREATE NOTE
noteRouter.post("/", auth, async (req, res) => {
    try {
        const { title, content } = req.body;

        if (
            typeof title !== "string" ||
            typeof content !== "string" ||
            !title.trim() ||
            !content.trim()
        ) {
            return res.status(400).send({
                msg: "Title and content are required"
            });
        }

        const note = new noteModel({
            userId: req.user.userId,
            title: title.trim(),
            content: content.trim()
        });

        await note.save();

        res.status(201).send({
            msg: "Note created successfully",
            note
        });

    } catch (error) {
        res.status(500).send({
            msg: "Failed to create note",
            error: error.message
        });
    }
});

// GET ALL NOTES OF LOGGED-IN USER
noteRouter.get("/", auth, async (req, res) => {
    try {
        const notes = await noteModel
            .find({ userId: req.user.userId })
            .sort({ createdAt: -1 });

        res.status(200).send({
            msg: "Notes fetched successfully",
            notes
        });

    } catch (error) {
        res.status(500).send({
            msg: "Failed to fetch notes"
        });
    }
});

// GET SINGLE NOTE
noteRouter.get("/:id", auth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send({
                msg: "Invalid note ID"
            });
        }

        const note = await noteModel.findOne({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!note) {
            return res.status(404).send({
                msg: "Note not found"
            });
        }

        res.status(200).send({ note });

    } catch (error) {
        res.status(500).send({
            msg: "Failed to fetch note"
        });
    }
});

// UPDATE NOTE
noteRouter.patch("/:id", auth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send({
                msg: "Invalid note ID"
            });
        }

        const { title, content } = req.body;
        const updates = {};

        if (title !== undefined) {
            if (typeof title !== "string" || !title.trim()) {
                return res.status(400).send({
                    msg: "Title cannot be empty"
                });
            }
            updates.title = title.trim();
        }

        if (content !== undefined) {
            if (typeof content !== "string" || !content.trim()) {
                return res.status(400).send({
                    msg: "Content cannot be empty"
                });
            }
            updates.content = content.trim();
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).send({
                msg: "Please provide a title or content"
            });
        }

        const note = await noteModel.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.user.userId
            },
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        if (!note) {
            return res.status(404).send({
                msg: "Note not found"
            });
        }

        res.status(200).send({
            msg: "Note updated successfully",
            note
        });

    } catch (error) {
        res.status(500).send({
            msg: "Failed to update note"
        });
    }
});

// DELETE NOTE
noteRouter.delete("/:id", auth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send({
                msg: "Invalid note ID"
            });
        }

        const note = await noteModel.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!note) {
            return res.status(404).send({
                msg: "Note not found"
            });
        }

        res.status(200).send({
            msg: "Note deleted successfully"
        });

    } catch (error) {
        res.status(500).send({
            msg: "Failed to delete note"
        });
    }
});

module.exports = { noteRouter };