// // const http = require("http");
// import http from "http"
// // const gfName = require("./feature")
// import gfName, {gfName1,gfName2} from "./feature.js";
// // import * as obj from "./feature.js";

// // console.log(http);
// console.log(gfName);
// const server = http.createServer((req, res) => {
//     // console.log(req.url)
//     if (req.url === "/about") {
//         res.end("<h1>about</h1>")
//     }
//     else if (req.url === "/contact") {
//         res.end("<h1>contact</h1>")
//     }
//     else if (req.url === "/") {
//         res.end("<h1>Home</h1>")
//     }
//     else{
//         res.end("<h1>Not found</h1>")
//     }
// })

// server.listen(5000, () => {
//     console.log('server is working');
// })

import cookieParser from "cookie-parser";
import express from "express"
// import { JsonWebTokenError } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import path from "path"
import bcrypt from "bcrypt"

// mongodb://127.0.0.1:27017
mongoose.connect("mongodb://127.0.0.1:27017", {
    dbName: "backend",
}).then(() => { console.log('Database Connected'); }).catch((e) => { console.log(e); })

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
}) 

const User = mongoose.model("User", userSchema);
const app = express();
// Using Middleware
// express.static(path.join("E:\nodejs\public"))  cannot do

app.use(express.static(path.join(path.resolve(), "public")))
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
// console.log(path.join(path.resolve(), "public"));
// setting up view engine
app.set("view engine", "ejs")

app.get("/add", async (req, res) => {
    await Messge.create({ name: "Anuragchauhan", email: "anuchu@gmail.com" })
    res.send("Database added")
 
})
// app.get("/", (req, res) => {
//     // res.send("Hi")
//     // res.send({
//     //     sucess: true,
//     //     products: []
//     // })
//     // res.sendStatus(500) 
//     // res.status(400).send("meri marzi") 
//     res.render("login")
// })

const isAuthenticated = async (req, res, next) => {
    const { token } = req.cookies
    if (token){
        const decoded = jwt.verify(token,"aaskdfkdfjkdf")
        req.user = await User.findById(decoded._id);
        next() 
    }
    else
        res.redirect("/login")
}
app.get("/", isAuthenticated, (req, res) => {
    res.render("logout", {name: req.user.name})
})
app.get("/register", (req, res) => {
    console.log('register');
    res.render("register")
})
app.get("/login", (req, res) => {
    res.render("login")
})
 

app.get("/logout", (req, res) => {
    res.cookie("token", null, {
        httpOnly: true, expires: new Date(Date.now())
    });
    res.redirect("/login")
})

app.post("/login", async (req, res)=>{
    const {email, password} = req.body;
    let user = await User.findOne({email})

    if(!user) return res.redirect("/register")
    const isMatch = bcrypt.compare(password, user.password)
    if(!isMatch) return res.render("login", {email,message:"Incorrect Password"})

    const token = jwt.sign({_id:user._id},"aaskdfkdfjkdf");
    // console.log(token);

    res.cookie("token", token, {
        httpOnly: true, expires: new Date(Date.now() + 60*1000)
    });
    res.redirect("/")

})
app.post("/register", async (req, res) => {

    const {name, email, password} = req.body
    let user = await User.findOne({email})
    if(user){
        // return console.log('Register first');
        return res.redirect("/login")
    }
    const hashPassword = await bcrypt.hash(password,10)
    user = await User.create({name,email,password:hashPassword})


    const token = jwt.sign({_id:user._id},"aaskdfkdfjkdf");
    // console.log(token);

    res.cookie("token", token, {
        httpOnly: true, expires: new Date(Date.now() + 60*1000)
    });
    res.redirect("/")
})


app.listen(5000, () => {
    console.log('Server is working');
})

