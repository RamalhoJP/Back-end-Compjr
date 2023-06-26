import bodyParser from 'body-parser';
import {Post, Auth} from '@/app/controllers';
import swaggerDocs from './swagger.json';

const express = require("express");
const app = express();
const port = 3000;
const swaggerUi = require('swagger-ui-express')
const cors = require('cors');
const axios = require("axios").create({baseUrl: `http://localhost:${port}`});

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); //request bodys do express

app.use('/post', Post);
app.use('/auth', Auth);

console.log(`Servidor rodando no link http://localhost:${port}`);
app.listen(port);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs)); //gera interface grafica do swagger