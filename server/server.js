// import { json } from "body-parser";

import express from "express";
import pkg from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Получаем путь к текущему файлу
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { json } = pkg;
let app = express();

app.use(express.static(path.join(__dirname, "..", "/dist")));
app.use(express.static(path.join(__dirname, "..", "/public")));
// app.use(express.static(path.join(__dirname, "..", "/src")));
app.use(express.static(path.resolve(__dirname, "..", "node_modules")));
app.use(json());

const port = 8088;

// Создаём HTTP-сервер
app.get("*", (req, res) => {
  // Устанавливаем HTTP-заголовок ответа с HTTP статусом и Content type
  res.sendFile(path.join(__dirname, "..", "/dist/index.html"));
});

// Выводим лог как только сервер будет запущен
app.listen(port, () => {});
console.log("Server start");