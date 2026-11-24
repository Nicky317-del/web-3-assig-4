const dns = require("dns");
dns.setServers(["8.8.8.8"]);

const express = require("express");
const cors = require("cors");

const { connection } = require("./db");
const { userRouter } = require("./routes/user.route");
const { noteRouter } = require("./routes/note.route");

const app = express();

app.use(cors());
app.use(express.json());

// USER ROUTES
app.use("/users", userRouter);

// NOTE ROUTES
app.use("/notes", noteRouter);

const PORT = 3000;

connection
    .then(() => {
        console.log("Connected to MongoDB");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.log("Database connection failed:", error);
    });