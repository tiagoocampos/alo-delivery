import express from "express";
import "dotenv/config";
import cors from "cors";
import { errorHandler } from "./middlewares/ErrorHandler.js";
import { router } from "./routes.js";

const app = express();
app.use(express.json());
app.use(cors());

app.use(errorHandler);
app.use(router)

app.get("/", (req, res) => {
    res.send("Hello World!");
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
})