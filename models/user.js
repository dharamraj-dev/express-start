const {Schema, model} = require('mongoose')
const {createHmac, randomBytes} = require('crypto')

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    salt: {
        type: String,
    },
    password: {
        type: String,
        required: true
    },
    profilePhoto: {
        type: String,
        default: "/Images/default.jpg"
    },
    role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: "USER"
    },
}, {timestamps: true})



userSchema.pre('save', function(next){
    
    const user = this;
    
    if(!user.isModified("password")) return;
    
    const salt = 'indiaismycountry';
    
    const hashedPassword = createHmac("sha256", salt).update(user.password).digest("hex")
    
    this.salt = salt;
    this.password = hashedPassword;
    
    next()
    
})

userSchema.static('passwordMatched', async function(email, password){
    const user = await this.findOne({email});

    if(!user) throw new Error("User Not Found!");

    const salt = user.salt;

    const hashedPassword = user.password;
    console.log(user)
    const comparepassword = createHmac("sha256", salt).update(password).digest("hex");
    console.log(comparepassword)
    if(hashedPassword !== comparepassword) throw new Error("Password is Incorrect");

    return {...user, password: undefined, salt, undefined};

})

const UserModel = model('users', userSchema);

module.exports = UserModel;