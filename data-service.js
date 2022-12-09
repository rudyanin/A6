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
var employee_data = [];
var department_data = [];

exports.initialize = function(){
    const fs = require('node:fs');

    fs.readFile('./data/employees.json',(err,data)=>{
        if (err) reject("Failure to read file employees.json!");
        employee_data = JSON.parse(data);
    });

    fs.readFile('./data/departments.json',(err,data)=>{
        if (err) reject("Failure to read file departments.json!");
        department_data = JSON.parse(data);
    });

    return new Promise(function(resolve, reject){
        console.log("initialize called");
        resolve("Data succesfully initialized!");
    });
}

exports.getAllEmployees = function(){
    return new Promise(function(resolve, reject){
            resolve(employee_data);
            reject(reason);
    });
}

exports.getManagers = function(){
    return new Promise(function(resolve, reject){  
        const manager_array = [];
        for(employee of employee_data){
            if(employee.isManager == true){
                manager_array.push(employee);
            }
        }
        resolve(manager_array);
        reject(reason);
    });
}

exports.getDepartments = function(){
    return new Promise(function(resolve, reject){ 
            resolve(department_data);
            reject(reason);
    });
}

exports.addEmployee = function(employeeData){
    return new Promise(function(resolve, reject){
        if(employeeData.isManager == null){
            employeeData.isManager = false;
        }
        else{
            employeeData.isManager = true; 
        }

        employeeData.employeeNum = employee_data.length + 1;
        employee_data.push(employeeData);
        resolve();
    });
}

exports.getEmployeesByStatus = function(status){
    return new Promise(function(resolve, reject){
        const temp = [];
        for(employee of employee_data){
            if(employee.status == status){
                temp.push(employee);
            }
        }
        resolve(temp);
    });
}

exports.getEmployeesByDepartment = function(Department){
    return new Promise(function(resolve, reject){
        const temp = [];
        for(employee of employee_data){
            if(employee.department == Department){
                temp.push(employee);
            }
        }
        resolve(temp);
    });
}

exports.getEmployeesByManager = function(Manager){
    return new Promise(function(resolve, reject){
        const temp = [];
        for(employee of employee_data){
            if(employee.employeeManagerNum == Manager){
                temp.push(employee);
            }
        }
        resolve(temp);
    });
}

exports.getEmployeeByNum = function(num){
    return new Promise(function(resolve, reject){
        var temp;
        for(employee of employee_data){
            if(employee.employeeNum == num){
                temp = employee;
            }
        }
        resolve(temp);
    });
}

exports.updateEmployee = function(employeeData){
    return new Promise(function(resolve, reject){
        for(employee of employee_data){
            if(employee.employeeNum == employeeData.employeeNum){
                var index = employee_data.indexOf(employee);
                employee_data[index] = employeeData;
            }
        }
        resolve();
    });
}