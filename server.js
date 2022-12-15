/*************************************************************************
* BTI325– Assignment 3
* I declare that this assignment is my own work in accordance with Seneca Academic
Policy. And I have taken help from my friend inorder to complete this and ihope this wont attract any
integrity problem for me and him
*
*
* Name: Rudra Bhosale Student ID: 162207211 Date: 18/11/2022
*
* Your app’s URL (from heroku) :https://afternoon-lake-64771.herokuapp.com/
*
*************************************************************************/ 
const data_services = require("./data-service.js")
var express = require("express"); 
var app = express();
const HTTP_PORT = process.env.PORT || 8080; 
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





app.set('view engine','.hbs');
app.use(function(req,res,next){
    let route=req.baseUrl + req.path;
    app.locals.activeRoute = (route=="/")? "/":route.replace(/\/$/,"");
    next();
});


app.get('/', (req, res) => {
  res.render('home', { layout: 'main' });
});

app.get('/about', (req, res) => {
  res.render('about', { layout: 'main' });
});

/*Updated  Employees Routes  */
app.get('/employees/add', (req, res) => {
  data_services
    .getDepartments()
    .then(function (data_services) {
      res.render('addEmployee', { departments: data_services });
    })
    .catch(() => res.render('addEmployee', { departments: [] }));
});

app.get('/employees', (req, res) => {
  if (req.query.status) {
    data_services
      .getEmployeesByStatus(req.query.status)
      .then((data_services) => {
        res.render('employees', { employee: data_services });
      })
      .catch((err) => {
        res.render({ message: 'no results' });
      });
  }

  if (req.query.department) {
    data_services
      .getEmployeesByDepartment(req.query.department)
      .then((data_services) => {
        res.render('employees', { employee: data_services });
      })
      .catch((err) => {
        res.render({ message: 'no results' });
      });
  }

  if (req.query.manager) {
    data_services
      .getEmployeesByManager(req.query.manager)
      .then((data_services) => {
        res.render('employees', { employee: data_services });
      })
      .catch((err) => {
        res.render({ message: 'no results' });
      });
  } else {
    data_services
      .getAllEmployees()
      .then((data_services) => {
        res.render('employees', { employee: data_services, layout: 'main' });
      })
      .catch((err) => {
        res.render({ message: 'no results' });
      });
  }
});
app.get('/employee/:empNum', (req, res) => {
  let viewData = {};
  data_services
    .getEmployeeByNum(req.params.empNum)
    .then((data_services) => {
      if (data_services) {
        viewData.employee = data_services;
      } else {
        viewData.employee = null;
      }
    })
    .catch(() => {
      viewData.employee = null;
    })
    .then(data_services.getDepartments)
    .then((data_services) => {
      viewData.departments = data_services;
      for (let i = 0; i < viewData.departments.length; i++) {
        if (viewData.departments[i].departmentId == viewData.employee.department) {
          viewData.departments[i].selected = true;
        }
      }
    })
    .catch(() => {
      viewData.departments = [];
    })
    .then(() => {
      if (viewData.employee == null) {
        res.status(404).send('Employee Not Found');
      } else {
        res.render('employee', { viewData: viewData });
      }
    });
});
app.get('/employees/delete/:empNum', (req, res) => {
  data_services
    .deleteEmployeeByNum(req.params.empNum)
    .then(() => res.redirect('/employees'))
    .catch(() =>
      res.status(500).send('Unable to Remove Employee / Employee not found')
    );
});
/*Updated  Department Routes*/
app.get('/departments', (req, res) => {
  data_services
    .getDepartments()
    .then((data_services) => {
      res.render('departments', {
        departments: data_services,
      });
    })
    .catch((err) => {
      res.render({ message: 'no results' });
    });
});

app.get('/departments/add', (req, res) => {
  res.render('addDepartment');
});

app.get('/department/:departmentId', (req, res) => {
  data_services
    .getDepartmentById(req.params.departmentId)
    .then((data_services) => {
      if (data_services.length > 0) res.render('department', { department: data_services });
      else {
        res.status(404).send('Department Not Found');
      }
    })
    .catch(() => {
      res.status(404).send('Department Not Found');
    });
});
/* Updated Image Routes */
app.get('/images/add', (req, res) => {
  res.render('addImage');
});

app.get("/images", (req, res) => {
  fs.readdir("./public/images/uploaded", function(err, imageFile){
      res.render("images",  { data: imageFile, title: "Images" });
  })

})

/* App posting methods  */
app.post('/images/add', upload.single('imageFile'), (req, res) => {
  res.render('addImage', { layout: 'main' });
});

app.post('/employees/add', (req, res) => {
  data_services
    .addEmployee(req.body)
    .then(() => res.redirect('/employees'))
    .catch((err) => res.json({ message: err }));
});

app.post('/employee/update', (req, res) => {
  data_services.updateEmployee(req.body).then((data_services) => {
    res.redirect('/employees/');
  });
});

app.post('/departments/add', (req, res) => {
  data_services
    .addDepartment(req.body)
    .then(() => res.redirect('/departments'))
    .catch((err) => res.json({ message: err }));
});

app.post('/departments/update', (req, res) => {
  data_services
    .updateDepartment(req.body)
    .then(res.redirect('/departments'))
    .catch((err) => res.json({ message: err }));
});

app.get('*', (req, res) => {
  res.status(404).send('Page Not Found');
});

data_services
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, () =>
      console.log(`Express http server listening on ${HTTP_PORT}`)
    );
  })
  .catch((e) => console.log(e));
