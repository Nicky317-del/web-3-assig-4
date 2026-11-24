
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { userModel } = require("../model/user.model");
const { auth } = require("../middleware/auth.middlewere");

const userRouter = express.Router();


// ================= REGISTER =================

userRouter.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        bcrypt.hash(password, 5, async (err, hash) => {

            if (err) {
                return res.status(500).send({
                    msg: "Something went wrong"
                });
            }

            try {
                const user = new userModel({
                    name,
                    email,
                    password: hash
                });

                await user.save();

                res.status(201).send({
                    msg: "User registered successfully"
                });

            } catch (error) {

    if (error.code === 11000) {
        return res.status(409).send({
            msg: "Email already registered. Please login."
        });
    }

    res.status(500).send({
        msg: "Something went wrong",
        error: error.message
    });
}
        });

    } catch (error) {
        res.status(500).send({
            msg: "Something went wrong"
        });
    }
});


// ================= LOGIN =================

userRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userModel.find({ email });

        if (user.length > 0) {

            bcrypt.compare(password, user[0].password, (err, result) => {

                if (err) {
                    return res.status(500).send({
                        msg: "Something went wrong"
                    });
                }

                if (result) {
                    const token = jwt.sign(
                    { userId: user[0]._id },
                    process.env.JWT_SECRET,
                   { expiresIn: "1d" }
);

                    res.send({
                        msg: "User login successfully",
                        token
                    });

                } else {
                    res.status(401).send({
                        msg: "Wrong credentials"
                    });
                }
            });

        } else {
            res.status(404).send({
                msg: "Signup first"
            });
        }

    } catch (error) {
        res.status(500).send({
            msg: "Something went wrong"
        });
    }
});


// ================= READ ALL USERS =================

userRouter.get("/", auth, async (req, res) => {
    if (req.user.userId !== req.params.id) {
    return res.status(403).send({
        msg: "You are not authorized to access this user"
    });
}
    try {
        const users = await userModel.find().select("-password");

        res.status(200).send({
            msg: "All users fetched successfully",
            users
        });

    } catch (error) {
        res.status(500).send({
            msg: "Something went wrong",
            error: error.message
        });
    }
});


// ================= READ SINGLE USER =================

userRouter.get("/:id", auth, async (req, res) => {
    try {
        const user = await userModel
            .findById(req.params.id)
            .select("-password");

        if (!user) {
            return res.status(404).send({
                msg: "User not found"
            });
        }

        res.status(200).send({
            msg: "User fetched successfully",
            user
        });

    } catch (error) {
        res.status(400).send({
            msg: "Invalid user ID"
        });
    }
});


// ================= UPDATE USER =================

userRouter.patch("/:id", auth, async (req, res) => {
    if (req.user.userId !== req.params.id) {
    return res.status(403).send({
        msg: "You are not authorized to update this user"
    });
}
    try {
        const { name, email } = req.body;

        const updateData = {};

        if (name !== undefined) {
            updateData.name = name;
        }

        if (email !== undefined) {
            updateData.email = email;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).send({
                msg: "Please provide name or email to update"
            });
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).send({
                msg: "User not found"
            });
        }

        res.status(200).send({
            msg: "User updated successfully",
            user: updatedUser
        });

    } catch (error) {
        res.status(400).send({
            msg: "Unable to update user",
            error: error.message
        });
    }
});


// ================= DELETE USER =================

userRouter.delete("/:id", auth, async (req, res) => {
    if (req.user.userId !== req.params.id) {
    return res.status(403).send({
        msg: "You are not authorized to delete this user"
    });
}
    try {
        const deletedUser = await userModel.findByIdAndDelete(
            req.params.id
        );

        if (!deletedUser) {
            return res.status(404).send({
                msg: "User not found"
            });
        }

        res.status(200).send({
            msg: "User deleted successfully"
        });

    } catch (error) {
        res.status(400).send({
            msg: "Invalid user ID"
        });
    }
});


module.exports = { userRouter };
