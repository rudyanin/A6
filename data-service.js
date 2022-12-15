const Sequelize = require('sequelize');
var sequelize = new Sequelize('soprdcje', 'soprdcje', 'ZJnW6MuJUeW4V7gs3t-qgugWw1rZHC68', {
 host: 'mel.db.elephantsql.com',
 dialect: 'postgres',
 port: 5432,
 dialectOptions: {
 ssl: true
},
query:{raw: true} 
});
sequelize.authenticate().then(()=> console.log('Connection success.'))
.catch((err)=>console.log("Unable to connect to DB.", err));
var Employee = sequelize.define('Employee', {
    employeeNum: {type: Sequelize.INTEGER, 
        primaryKey: true, 
        autoIncrement: true},
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.INTEGER,
    hireDate: Sequelize.STRING
});
var Department = sequelize.define('Department', {
    departmentId: {type: Sequelize.INTEGER, 
        primaryKey: true, 
        autoIncrement: true},
    departmentName: Sequelize.STRING
});
exports.initialize = function(){
    return new Promise(function (resolve, reject) {
        sequelize.sync()
        .then(() => resolve("Connected Successfully"))
        .catch(() => reject("Connection Error"));
       });
}
exports.getAllEmployees = function(){
    return new Promise(function (resolve, reject) {
        Employee.findAll()
        .then((data) => resolve(data))
        .catch(() => reject("No Results Found"));
       });
}
exports.getManagers = function(){
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: {
              employeeManagerNum: manager,
            },
          })
            .then((data) => { resolve(data); })
            .catch((err) => { reject("No Results Found");
            });
       });
       
}
exports.getDepartments = function(){
    return new Promise(function (resolve, reject) {
        Department.findAll()
        .then((data) => resolve(data))
        .catch(() => reject("No Results Found"));
       });
}
exports.addEmployee = function(employeeData){
    employeeData.isManager = (employeeData.isManager) ? true : false;
    return new Promise(function (resolve, reject) {
        for (let i in employeeData){
            if (employeeData[i] === '')
                employeeData[i] = null;
        }
        Employee.create(employeeData)
        .then((data) => resolve(data))
        .catch(() => reject("No Results Found"));
    });
}
exports.getEmployeesByStatus = function(statu){
    return new Promise(function (resolve, reject) {
        Employee.findAll({where:{status: statu}})
        .then((data) => resolve(data))
        .catch(() => reject("No Results Found"));
       });
}
exports.getEmployeesByDepartment = function(Department){
    return new Promise(function (resolve, reject) {
        Employee.findAll({where:{department: Department}})
        .then((data) => resolve(data))
        .catch(() => reject("No Results Found"));
       });
}
exports.getEmployeesByManager = function(manager){
    return new Promise(function (resolve, reject) {
        Employee.findAll({where:{employeeManagerNum: manager}})
        .then((data) => resolve(data))
        .catch(() => reject("No Results Found"));
       });
}
exports.getEmployeeByNum = function(num){
    return new Promise(function (resolve, reject) {
        Employee.findAll({where:{employeeNum: num}})
        .then((data) => resolve(data[0]))
        .catch(() => reject("No Results Found"));
       });
}

exports.updateEmployee = function(employeeData){
    employeeData.isManager = (employeeData.isManager) ? true : false;
    return new Promise(function (resolve, reject) {
        for (let i in employeeData){
            if (employeeData[i] === '')
                employeeData[i] = null;
        }
        Employee.update(employeeData, {
            where: { employeeNum: employeeData.employeeNum }})
        .then((data) => resolve(data))
        .catch(() => reject("No Results Found"));
       });
}

exports.addDepartment = function(department){
    return new Promise(function(resolve, reject){

        for (let i in department){
            if (department[i] === '')
                department[i] = null;
        }
        Department.create(department)
        .then((data) => resolve(data))
        .catch(() => reject("No Results Found"));
    });
}

exports.updateDepartment = function(department){
    return new Promise(function(resolve, reject){
        for (let i in department){
            if (department[i] === '')
                department[i] = null;
        }
        Department.update(department, { where: { departmentId: department.departmentId }})
        .then((data) => resolve(data))
        .catch(() => reject("No Results Found"));
    });
}

exports.getDepartmentById = function (id) {
    return new Promise((resolve, reject) => {
      Department.findAll({where: {departmentId: id}})
        .then((data) => resolve(data))
        .catch(() => reject("No Results Found"))
    });
  };

exports.getManagers = function(){
    return new Promise(function(resolve, reject){
        Employee.findAll({where: { employeeManagerNum: manager }})
            .then((data) => {resolve(data);})
            .catch((err) => { reject("No Results Found");});
        });
    }

exports.deleteEmployeeByNum = function (num) {
    return new Promise((resolve, reject) => {
      Employee.destroy({where: { employeeNum: num } })
        .then(() => resolve())
    });
  };