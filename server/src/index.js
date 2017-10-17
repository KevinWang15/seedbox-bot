import express from "express";
import cors from "cors";
import { server } from "./config";
import api from './api';

const app = express();
app.use(cors());
api.forEach(apiEntry => {
  app.use('/' + apiEntry[0], apiEntry[1]);
});

app.listen(server.port);

