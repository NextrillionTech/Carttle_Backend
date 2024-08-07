const mongoose=require("mongoose");

const employeeScheme = new mongoose.Schema({
    username: {
        type:String,
        require:true
    },
    number: {
        type:Number,
        unique: true,
        require:true
    },
    password: {
        type:String,
        require:true
    }
})

const Register = new mongoose.model('Registration', employeeScheme);
module.exports=Register;