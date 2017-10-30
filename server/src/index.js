import "babel-polyfill";
import express from "express";
import path from "path";
import cors from "cors";
import { server } from "./config";
import api from './api';
import bodyParser from "body-parser";
import { sequelize } from "./databaseConnection";
import "./models";

sequelize.sync().then(() => {
  const app = express();
  app.use(express.static(path.join(__dirname, 'ui')));
  app.use(bodyParser.json());
  app.use(cors());
  api.forEach(apiEntry => {
    app.use('/' + apiEntry[0], apiEntry[1]);
  });

  app.listen(server.port);
});
