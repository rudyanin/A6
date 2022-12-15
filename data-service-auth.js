var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var Schema = mongoose.Schema;
var exports = module.exports = {};
mongoose.set('debug', true);
var userSchema =  new Schema({
    "userName": {"type" : String, "unique" : true },
    "password": String,
    "email" : String,
    "loginHistory" : [{"dateTime" : Date, "userAgent" :  String}]
});
let User; 
function check(str){ 
    return str === null || str.match(/^ *$/) !== null;
}

exports.initialize = function(){
    return new Promise(function(resolve, reject){
        let db = mongoose.createConnection(`mongodb+srv://Rudra12:123%4045678@senecaweb.o1c1hub.mongodb.net/?retryWrites=true&w=majority`);
        db.on('error', function(err){
            reject("Could not connect to MongoDB");
        })
        db.once('open', function(){
        console.log("Connected to MongoDB");
           User = db.model("users", userSchema);
            resolve();
        })
    });
}    

exports.registerUser = function(userData){
     return new Promise(function(resolve,reject){
        console.log("Register User");
        if (check(userData.password) || check(userData.password2))
                reject("Error: password cannot be empty or only white spaces!")
        else if (userData.password != userData.password2)
            reject("Error: Passwords do not match");
        else{
            var newUser = new User(userData);
            bcrypt.genSalt(10, function(err, salt) { 
                bcrypt.hash(newUser.password, salt, function(er, hash) { 
                    if (!er){
                        newUser.password = hash;
                        newUser.save().then(()=>{
                            resolve();
                      }).catch(err=>{
                            if(err.code == 11000)
                                reject("User Name already taken");
                            else
                                reject(`"There was an error creating the user: ${err}`);
                      });
                    }
                });
            });
        }
    });
}

exports.checkUser = function(userData){
    return new Promise(function(resolve,reject){
        console.log("Check User");
        User.findOne({userName : userData.userName}).exec()
        .then(function(foundUser){
            if (foundUser){
                bcrypt.compare(userData.password, foundUser.password).then(function(check){
                    if (check == false)
                        reject(`Incorrect Password for user: ${userData.userName}`);
                    else{ 
                        foundUser.loginHistory.push({dateTime : new Date().toString(), userAgent : userData.userAgent});
                        User.update({userName : foundUser.userName},  { $set: {loginHistory: foundUser.loginHistory}}, 
                            { multi: false}).exec()
                            .then(function(){ resolve(foundUser)})
                            .catch(function(err){
                                reject(`There was an error verifying the user : ${err}`);
                        })
                    }
                })
            }
            else
                reject(`Unable to find user :  ${userData.userName}`);
        })
        .catch(function(err){
                reject(`Unable to find user :  ${userData.userName}`);
        });
    })
}