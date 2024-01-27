import express from "express";

const app = express();

app.use(express.json({limit: "10kb"}));
app.use(express.urlencoded({extended: true}))

export default app;