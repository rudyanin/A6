/*************************************************************************
* BTI325– Assignment 3
* I declare that this assignment is my own work in accordance with Seneca Academic
Policy. And I have taken help from my friend inorder to complete this and ihope this wont attract any
integrity problem for me and him
*
*
* Name: Rudra Bhosale Student ID: 162207211 Date: 18/11/2022
*
* Your app’s URL (from heroku) : https://calm-cove-20683.herokuapp.com/
*
*************************************************************************/ 
const data_services = require("./data-service.js")
var express = require("express"); 
var app = express();
var path = require("path"); 
const fs =require('fs');
var exphbs = require('express-handlebars');
app.use(express.json());
app.use(express.urlencoded({extended: true}));
var multer =  require('multer');
var storage = multer.diskStorage({

    destination : "./public/images/uploaded", 
    filename: function(req, file, cb){
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
  
});

const upload = multer({storage : storage});
app.use(express.static('public'));

app.engine('.hbs',exphbs.engine({
    extname:'.hbs', 
    defaultLayout:'main',
    helpers:{
        navLink:function(url, options){
            return '<li' + ((url==app.locals.activeRoute)? ' class="active"':'')
                +'><a href="'+url+'">'+options.fn(this)+'</a></li>'
        },
        equal:function(lvalue, rvalue, options){
            if(arguments.length<3)
                throw new Error("Handlerbars Helper equal needs 2 parameters");
            if(lvalue != rvalue){
                return options.inverse(this);
            }else{
                return options.fn(this);
            }
        }
    }
}));
app.set('view engine','.hbs');

var HTTP_PORT = process.env.PORT || 8080; 
function onHttpStart(){
    console.log("Express http server listening on: " + HTTP_PORT);
}

app.set('view engine','.hbs');
app.use(function(req,res,next){
    let route=req.baseUrl + req.path;
    app.locals.activeRoute = (route=="/")? "/":route.replace(/\/$/,"");
    next();
});


app.get("/", (req, res) => {
    res.render("home");
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/employees/add", (req, res) => {
    
    res.render("addEmployee");
});

app.get("/images/add", (req, res) => {
    res.render("addImage");
});

app.get('/employee/:employeeNum', (req, res) => {
    data_services.getEmployeeByNum(req.params.employeeNum)
    .then((data) => res.render("employee",{employee:data}))
    .catch(()=>{res.render("employee",{message:"no results"})
})
});

//modified routes
app.get('/employees', (req, res) => {
    if(req.query.status) {
        data_services.getEmployeesByStatus(req.query.status)
            .then((data) => res.render("employees",{employees:data}))
            .catch(() => res.render("employees",{message: "no results"}))
    }else if(req.query.manager){
        data_services.getEmployeesByManager(req.query.manager)
            .then((data) => res.render("employees",{employees:data}))
            .catch(() => res.render("employees",{message: "no results"}))
    }else if(req.query.department){
        data_services.getEmployeesByDepartment(req.query.department)
            .then((data) => res.render("employees",{employees:data}))
            .catch(() => res.render("employees",{message: "no results"}))
    }else{
        data_services.getAllEmployees()
            .then((data) => res.render("employees",{employees:data}))
            .catch(() => res.render("employees",{message: "no results"}))
    }
});

/*app.get("/managers",function(req,res){
    data_services.getManagers().then(function(data){
        res.json(data);
    })
    .catch(function(err){
        res.json({"message":err})
   // })
})*/

app.get('/departments', (req, res) => {
    data_services.getDepartments()
        .then((data) => res.render("departments",{departments:data}))
        .catch(() => res.render("departments",{"message": "no results"}))
})

 
app.get("/images/add", function(req,res){
    res.sendFile(path.join(__dirname + views + "addImage.html"));
  })

app.get("/images", (req, res) => {
    fs.readdir("./public/images/uploaded", function(err, imageFile){
        res.render("images",  { data: imageFile, title: "Images" });
    })

})

app.post("/images/add", upload.single("imageFile"), function(req, res){  
    res.redirect("/images")
  });


  app.post('/employees/add', function(req, res) {
    data_services.addEmployee(req.body)
        .then(res.redirect('/employees'))
        .catch((err) => res.json({"message": err}))   
}) 

// A filter in which employye number is taken and detailes are shown


app.post("/employee/update", function(req, res){
    data_services.updateEmployee(req.body)
    .then(res.redirect('/employees'))
});
 
app.use((req, res) => {
    res.status(404).send("Sorry Guys This page is not found");
  });


data_services.initialize().then(function(data){
    app.listen(HTTP_PORT, onHttpStart);
  
  }).catch(function(err){
    console.log(err);
  })


  

  