const mongoose=require('mongoose');
const adminSchema=new mongoose.Schema({
    name:{type:String},
    email:{type:String},
    password:{type:String},
    resturentname:{type:String},
    phonenumber:{type:Number},
});

const AdminModel=mongoose.model('admin',adminSchema);

const adminAdditems=new mongoose.Schema({
    adminId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Admin', // 'Admin' is the model name of the admin schema
        required: true 
    },
    resturentName:{type:String,required:true},
    foodName:{type:String,required:true},
    foodType:{type:String,required:true},
    foodPrice:{type:Number,required:true},
    foodImage:{type:String},
    foodDescription:{type:String,required:true},
    lat:{type:String,required:true},
    lon:{type:String,required:true},
    createdAt: { type: Date, default: Date.now() },
});
const AdminAddItemsModel=mongoose.model('adminAdditems',adminAdditems);

const addedItemsInCart=new mongoose.Schema({
     userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', // assuming your user model is named 'user'
        required: true
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'adminAdditems',
        required: true
    },
    quantity: {
        type: Number,
        default: 1
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});
const CartModel=mongoose.model('cart',addedItemsInCart);

const ordersDataSchema=new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', // assuming your user model is named 'user'
        required: true
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'adminAdditems',
        required: true
    },
    quantity: {
        type: Number,
        default: 1
    },
    orderDate: {
        type: Date,
        default: Date.now
    }
});
const ordersModel=mongoose.model('orders',ordersDataSchema);
module.exports={AdminModel,AdminAddItemsModel,CartModel,ordersModel};