// const express = require('express');

// const app = express();
// app.set('PORT', process.env.PORT || 3000);

// app.get('/', (req, res) => {
//     // res.send('Hello, Express');
//     res.sendFile(path.join(_dirname, 'index.html'))
// })

// app.listen(app.get('port'), () => {
//     console.log(app.get('port'), '번 포트에서 대기 중')
// })

// app.set('port', process.env.PORT || 3000);

// app.use((req, res, next) => {
//     console.log("모든 요청에 다 실행됩니다.");
//     next();
// })

// app.get('/', (req, res) => {
//     console.log("GET / 요청에서만 다 실행됩니다.");
//     next();
// }, (req,res) => {
//     throw new Error("에러는 에러 처리 미들웨어로 넘어갑니다.");
// })

// app.use('/', (err, req, res, next) => {
//     console.error(err)
//     res.status(500).send(err.message);
// })

// app.listen('port', process.env.PORT || 3000);

// app.use(morgan('dev'));

// app.use('요청 경로', express.static('실제 경로'));

// app.use('/', express.static(path.join(_dirname, 'public')));

// app.use(express.json());
// app.use(express.urlencoded({extended: false}));

// const bodyParser = require('body-parser');
// app.use(bodyParser.raw());
// app.use(bodyParser.text());

// res.cookie('name','zerocho', {
//     expires: new Date(Date.now() + 900000),
//     httpOnly: true,
//     secure: true,
// });
// res.clearCookie('name','zerocho')

const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const dotenv = require("dotenv");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

dotenv.config();
const app = express();
app.set("port", process.env.PORT);

app.use(morgan("dev"));
app.use("/", express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
    name: "session-cookie",
  }),
);

try {
  fs.readFileSync("uploads");
} catch (error) {
  console.error(error);
  fs.mkdirSync("uploads");
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, "uploads/");
    },
    filename(req, file, done) {
      const ext = path.extname(file.originalname);
      done(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.get("/upload", (req, res, next) => {
  res.sendFile(path.join(__dirname, "multipart.html"));
});

app.post("/upload", upload.single("image"), (req, res) => {
  console.log(req.file, req.body);
  res.send("ok");
});

app.use((req, res, next) => {
  console.log("모든 요청에서 다 실행됩니다.");
  next();
});

app.get(
  "/",
  (req, res, next) => {
    console.log("GET / 요청에서만 실행됩니다.");
    next();
  },
  (req, res) => {
    throw new Error("에러는 에러처리 미들웨어로 갑니다.");
  },
);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(err.message);
});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번에서 실행 대기중");
});
