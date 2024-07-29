import express, { response } from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

const server = express();

let PORT = 3000;

mongoose.connect(process.env.MONGODB_URI, { autoIndex: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

server.post("/signup", (req, res) => {
    res.json(req.body);
})

server.listen(PORT, () => {
  console.log("Listening on port: " + PORT);
});
