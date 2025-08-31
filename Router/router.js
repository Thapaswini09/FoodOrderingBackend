const upload=require('../Middleware/multerConfig.js')
const {adminAuthomtication,userAuthontication} = require('../Middleware/userAuthontication');
const express=require('express');
const router=express.Router();
const UserController=require('../users/userController');
const AdminController=require('../Admin/adminController');
//User
router.post('/users-register',UserController.createUser);
router.post('/user-login',UserController.loginUser);
router.get('/user-getall-items',userAuthontication,UserController.getAllItemsData);

//User - Crat Data
router.post('/user-add-to-cart',userAuthontication,UserController.cartData);
router.get('/user-get-carts',userAuthontication,UserController.getCartData);

//USER - ORDERS
router.post('/single-order-data',userAuthontication,UserController.orderdData);
router.post('/all-order-data',userAuthontication,UserController.allOrderdata);
router.get('/user-get-orders',userAuthontication,UserController.getOrdersData);
router.delete('/user-delete-carts/:id',userAuthontication,UserController.deleteCartData);
//Admin
router.post('/admin-register',AdminController.adminRegister);
router.post('/admin-login',AdminController.adminLogin)
router.post('/add-items',adminAuthomtication,upload.single('foodImage'),AdminController.adminAddedItems);
router.get('/admin-get-items',adminAuthomtication,AdminController.getAdminAddItems);

//ORDER
router.get('/admin-order-details',adminAuthomtication,AdminController.getOrderDetailsAdmin);
module.exports=router;