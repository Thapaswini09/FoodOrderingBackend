const {AdminModel,AdminAddItemsModel}=require('./adminSchema');
const {Validation,itemsValidations}=require('./validation');
const {ordersModel}=require('../Admin/adminSchema');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
class AdminController{
    async adminRegister(req,res){
        try {
            const schema = Validation();
            const { error, value }=await schema.validate(req.body);
            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }
            const email=await AdminModel.findOne({email:value.email});
            if(email){
                return res.status(400).json({ message: 'email already exist' });
            }
            const salt=await bcrypt.genSalt(10);
            value.password=await bcrypt.hash(value.password,salt);
          const userData=new AdminModel(value);
          await userData.save();
          return res.status(201).json({ message: 'admin created successfully' });
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async adminLogin(req,res){
        try {
            const {email,password}=req.body;
            if(!email || !password){
                return res.status(400).json({ message: 'Please enter email and password' });
            }
            const admin=await AdminModel.findOne({email});
            if(!admin){
                return res.status(400).json({ message: 'Invalid email' });
            }
            const isMatch=await bcrypt.compare(password,admin.password);
            if(!isMatch){
                return res.status(400).json({ message: 'Invalid password' });
            }
            const token = jwt.sign({id: admin}, process.env.ADMIN_SECRET_KEY, {expiresIn: '1h'});
            res.cookie('adminToken', token, {
                httpOnly: true,
                maxAge: 60 * 60 * 1000 // 10 minutes
            });
            return res.status(200).json({ message: 'Login successfully',data:admin,token:token });

        } catch (error) {
            return res.status(500).json({ message: 'Internal server error' });
            
        }
    }

    async adminAddedItems(req,res){
        try {
            const schema = itemsValidations();
            const { error, value }=await schema.validate(req.body);
            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }
            if (!req.file) {
            return res.status(400).json({ message: '"foodImage" is required' });
             }
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            value.foodImage = `${baseUrl}/uploads/${req.file.filename}`; 
            value.adminId = req.admin.id._id;
            const adminItems=new AdminAddItemsModel(value);
            await adminItems.save();
            return res.status(201).json({ message: 'Item added successfully' });
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async getAdminAddItems(req,res){
        try {
            const adminItems=await AdminAddItemsModel.find({adminId:req.admin.id._id});
            return res.status(200).json({ message: 'Items fetched successfully',data:adminItems });
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    }


async getOrderDetailsAdmin(req, res) {
    try {
        const decodedAdminId = req.admin.id._id;

        const items = await AdminAddItemsModel.find({ adminId: decodedAdminId });

        const itemIds = items.map(item => item._id);

        const ordersWithDetails = await ordersModel.aggregate([
            {
                $match: {
                    itemId: { $in: itemIds }
                }
            },
            {
                $lookup: {
                    from: 'users', // Replace with actual collection name if different
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $unwind: {
                    path: '$userDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'adminadditems', // Replace with actual collection name if different
                    localField: 'itemId',
                    foreignField: '_id',
                    as: 'itemDetails'
                }
            },
            {
                $unwind: {
                    path: '$itemDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    itemId: 1,
                    quantity: 1,
                    userDetails: {
                        _id: 1,
                        name: 1,
                        email: 1,
                        gender:1,
                        phonenumber:1,
                        latitude:1,
                        longitude:1
                    },
                    itemDetails: {
                        _id: 1,
                        resturentName: 1,
                        foodName: 1,
                        foodType: 1,
                        foodPrice: 1,
                        foodImage: 1,
                        foodDescription: 1,
                        lat: 1,
                        lon: 1
                    }
                }
            }
        ]);

        return res.status(200).json({
            message: 'Orders fetched successfully',
            data: ordersWithDetails
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

}
module.exports=new AdminController();