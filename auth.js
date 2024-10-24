const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

// mongodb connection
mongoose
    .connect("mongodb://localhost:27017/auth")
    .then(() => {
        console.log("mongodb connected");
        app.listen(8000, (req, res) => {
            console.log("server is running at port 8000");
        });
    })
    .catch(() => {
        console.log("failed to connect");
    });

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

// create user model
const userModel = mongoose.model("user", userSchema);

app.use(express.json());

// endpoint to register a user
app.post("/register", (req, res) => {
    let user = req.body;
    bcrypt.genSalt(10, function (err, salt) {
        if (!err) {
            bcrypt.hash(user.password, salt, function (err, hash) {
                // Store hash in your password DB.
                if (!err) {
                    user.password = hash;
                    userModel
                        .create(user)
                        .then((data) => {
                            res.send({ message: "user registered successfully" });
                        })
                        .catch((err) => {
                            res.send({ message: "error in registering user" });
                        });
                } else {
                    res.send({ message: "error in hashing password" });
                }
            });
        } else {
            res.send({ message: "error in generating salt" });
        }
    });
});

// endpoint for user login
app.post("/login", (req, res) => {
    let user = req.body;
    userModel
        .findOne({ email: user.email })
        .then((data) => {
            if (data) {
                bcrypt.compare(user.password, data.password, function (err, same) {
                    if (same) {
                        jwt.sign({ email: user.email }, "Johnson55", function (err, token) {
                            if (!err) {
                                res.send({ message: "login success", token: token });
                            } else {
                                res.send({ message: "error in token generation" });
                            }
                        });
                    } else {
                        res.send({ message: "wrong credentials" });
                    }
                });
            } else {
                res.send({ message: "user not found" });
            }
        })
        .catch((err) => {
            res.send({ message: "error in login" });
        });
});

// endpoint to getdata
app.get("/getdata", verifyToken, (req, res) => {
    res.send({ message: "data fetched successfully" });
});

// verifyToken function
function verifyToken(req, res, next) {
    let token = req.headers.authorization.split(" ")[1];
    if (token) {
        jwt.verify(token, "Johnson55", function (err, decoded) {
            if (!err) {
                console.log(decoded); // bar
                next();
            }else{
                     res.send({message:"invalid token"})
            }
        });
    } else {
        res.send({ message: "unauthorized user" });
    }
}
