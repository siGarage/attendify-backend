import express from "express";
import Stream from 'stream';
import conf from "./database/mongoose.js";
import helmet from "helmet";
import cors from 'cors';
import Router from "./routes/api.js";
import morgan from "morgan";
import path, { dirname } from 'path';
import { CronJob } from 'cron';
import { fileURLToPath } from 'url';
import * as http from 'http';
import { createLogger, transports, format } from 'winston';
const { combine, timestamp, prettyPrint, colorize, errors, } = format;
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

// app.use(helmet())

// Function to serve all static files
// inside public directory.

app.use(cors())

app.use(express.json())
app.use(morgan('dev'))

app.use(express.static('public'));
app.use('/images', express.static('images'));
// app.use(`/images`, express.static(path.join(__dirname, `uploads`)));
conf();




const port = 4500


app.use(express.urlencoded({ extended: true }));


/*********************** For Local Logger ***********************/




app.use(Router);
app.disable('x-powered-by');


app.listen(4500);
