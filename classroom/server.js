const express = require("express");
const app = express();
const session = require("express-session");
const port =3000;
const flash = require("connect-flash");
const path = require("path");
const sessionOptions = {
  secret: "mysupersecretstring",
  resave: false,
  saveUninitialized: true,
};
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(session(sessionOptions));
app.use(flash());

app.get("/register", (req, res) => {
  let { name="ananomous" } = req.query;
  req.session.name= name;
    console.log(req.session.name);
    req.flash("success","user registered succesfully");
    res.redirect("/hello")
  
});

app.get("/hello",(req,res)=>{
    res.locals.messages = req.flash("success");
    res.render("page.ejs",{name: req.session.name});
})

app.listen(port,()=>{
    console.log(`App is running on port ${port}`);
})