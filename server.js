/*********************************************************************************
* BTI325 – Assignment 6
* The code that was provided by the professor is used as the base since I couldnt 
* submit my last assignment and I was facing problems with MongoDB connections 
* and pgadmins so I had to take help from my friend in resolving that
* Hope this does not attract any academic integrity issue.
* 
* Name:Rudra Vijay Bhosale Student ID: 162207211 Date: 12/15/2022
* Online (Heroku Cyclic) Link:
*
********************************************************************************/ 

var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();
var path = require("path");
var data_services = require("./data-service")
var services_auth = require("./data-service-auth")
var sessions = require("client-sessions");
const exphbs = require("express-handlebars");
app.engine('.hbs', exphbs.engine({
  extname: '.hbs', defaultLayout: 'main', helpers: {
    navLink: function (url, options) {
      return '<li' + ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
        '><a href=" ' + url + ' ">' + options.fn(this) + '</a></li>';
    },
    equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    }
  }
}));
app.set('view engine', '.hbs');
app.use(sessions({
  cookieName: "session", 
  secret: "HEEFNJENFSKDF_DKUAFKSBFKJ", 
  duration: 2 * 60 * 1000, 
  activeDuration: 1000 * 60 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(function (req, res, next) {
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
  next();
});
app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

var multer = require("multer");
const storage = multer.diskStorage({
  destination: "./public/images/uploaded",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });
app.post("/images/add", ensureLogin, upload.single("imageFile"), (req, res) => {
  res.redirect("/images");
});
const fs = require('node:fs');
app.get("/images", ensureLogin, function (req, res) {
  fs.readdir("./public/images/uploaded", (err, items) => {
    if (err)
      console.log(err);
    else {
      res.render("images", { images: items });
    }
  });
});

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static('public'));

app.get("/", function (req, res) {
  res.render('home');
});

app.get("/about", function (req, res) {
  res.render('about');
});

app.get("/employees", ensureLogin, function (req, res) {
  if (req.query.status) {
    var stat = req.query.status;
    data_services.getEmployeesByStatus(stat)
      .then((data) => {
        if (data.length > 0) { res.render("employees", { employees: data }) }
        else { res.render("employees", { message: "no results" }) };
      })
      .catch((err) => { res.render({ message: "No Results" }) });
    return;
  }
  else if (req.query.department) {
    var department = req.query.department;
    data_services.getEmployeesByDepartment(department)
      .then((data) => {
        if (data.length > 0) { res.render("employees", { employees: data }) }
        else { res.render("employees", { message: "no results" }) };
      })
      .catch((err) => { res.render({ message: "No Results" }) });
    return;
  }
  else if (req.query.manager) {
    var manager = req.query.manager;
    data_services.getEmployeesByManager(manager)
      .then((data) => {
        if (data.length > 0) { res.render("employees", { employees: data }) }
        else { res.render("employees", { message: "no results" }) };
      })
      .catch((err) => { res.render({ message: "No Results" }) });
    return;
  }
  else {
    data_services.getAllEmployees()
      .then((data) => {
        if (data.length > 0) { res.render("employees", { employees: data }) }
        else { res.render("employees", { message: "no results" }) };
      })
      .catch((err) => { res.render("employees", { message: "no results" }) });
    return;
  }
})

app.get("/employee/:empNum", ensureLogin, (req, res) => {
  
  let viewData = {};
  data_services.getEmployeeByNum(req.params.empNum).then((data) => {
    if (data) {
      viewData.employee = data; 
    } else {
      viewData.employee = null; 
    }
  }).catch(() => {
    viewData.employee = null; 
  }).then(data_services.getDepartments)
    .then((data) => {
      viewData.departments = data; 
      "departments"
      
      for (let i = 0; i < viewData.departments.length; i++) {
        if (viewData.departments[i].departmentId == viewData.employee.department) {
          viewData.departments[i].selected = true;
        }
      }
    }).catch(() => {
      viewData.departments = [];
    }).then(() => {
      if (viewData.employee == null) { 
        res.status(404).send("Employee Not Found");
      } else {
        res.render("employee", { viewData: viewData }); 
      }
    });
});

app.get('/employees/add', ensureLogin, (req, res) => {
  data_services.getDepartments()
    .then(function (data) {
      res.render('addEmployee', { departments: data });
    })
    .catch(() => res.render('addEmployee', { departments: [] }));
});

app.get('/employees/delete/:empNum', (req, res) => {
  data_services.deleteEmployeeByNum(req.params.empNum)
    .then(() => res.redirect('/employees'))
    .catch(() => res.status(500).send('delete employee error'));
});

app.post("/employee/update", ensureLogin, (req, res) => {
  data_services.updateEmployee(req.body)
    .then(() => { res.redirect("/employees"); })
    .catch((err) => { res.json({ message: err }) });
});

app.get("/images/add", ensureLogin, function (req, res) {
  res.render('addImage');
});

app.get("/managers", ensureLogin, function (req, res) {
  data_services.getManagers()
    .then((data) => { res.json(data) })
    .catch((err) => { res.json({ message: err }) });
});

app.get("/departments", ensureLogin, function (req, res) {
  data_services.getDepartments()
    .then((data) => {
      if (data.length > 0) { res.render("departments", { departments: data }) }
      else { res.render("departments", { message: "no results" }) };
    })
    .catch((err) => { res.json({ message: err }) });
});



app.get("/departments/add", ensureLogin, function (req, res) {
  res.render('addDepartment');
});





app.post('/departments/add', ensureLogin, (req, res) => {
  data_services.addDepartment(req.body)
    .then(() => res.redirect('/departments'))
    .catch((err) => res.json({ message: err }));
});





app.post('/departments/update', ensureLogin, (req, res) => {
  data_services.updateDepartment(req.body)
    .then(res.redirect('/departments'))
    .catch((err) => res.json({ message: err }));
});

app.get('/department/:departmentId', ensureLogin, (req, res) => {
  data_services.getDepartmentById(req.params.departmentId)
    .then((data) => {
      if (data.length > 0) {
        res.render('department', { department: data })
      }
      else {
        res.status(404).send("Department Not Found");
      }
    })
    .catch(() => {
      res.status(404).send("No Results Returned");
    });
});






app.post("/employees/add", ensureLogin, function (req, res) {
  data_services.addEmployee(req.body)
    .then(() => { res.redirect("/employees") })
    .catch((err) => { res.json({ message: err }) });
});

app.get("/login", function (req, res) {
  res.render('login');
});

app.get("/register", function (req, res) {
  res.render('register');
});

app.post("/register", function (req, res) {
  services_auth.registerUser(req.body)
    .then(() => { res.render('register', { successMessage: "User created" }) })
    .catch((err) => { res.render('register', { errorMessage: err, userName: req.body.userName }) });
});

app.post("/login", function (req, res) {
  req.body.userAgent = req.get('User-Agent');
  services_auth.checkUser(req.body).then((user) => {
    req.session.user = {
      userName: user.userName, 
      email: user.email, 
      loginHistory: user.loginHistory 
    }
    res.redirect('/employees');
  })
    .catch((err) => { res.render('login', { errorMessage: err, userName: req.body.userName }) });
});

app.get("/logout", function (req, res) {
  req.session.reset();
  res.redirect('/');
});


app.get("*", function (req, res) {
  res.send("Uh Oh! Error 404: File Not Found");
});



app.get("/userHistory", ensureLogin, function (req, res) {
  res.render('userHistory');
});


data_services.initialize()
  .then(services_auth.initialize)
  .then(function () {
    app.listen(HTTP_PORT, function () {
      console.log("app listening on: " + HTTP_PORT)
    });
  }).catch(function (err) {
    console.log("unable to start server: " + err);
  });
