import express from "express";
import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middlewares/ErrorHandler.js";
import { router } from "./routes.js";

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Hello World!");
})

app.use(router)

// O errorHandler precisa ser o último middleware: só assim ele recebe os erros
// lançados pelas rotas.
app.use(errorHandler);

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
})
