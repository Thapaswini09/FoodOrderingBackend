const joi=require('joi');
 const Validation=()=>{
    return joi.object({
        name:joi.string().required(),
        email:joi.string().required(),
        password:joi.string().required().min(8).max(100),
        age:joi.number().required().min(10).max(100),
        phonenumber:joi.number().required(),
        gender:joi.string().required().valid('male','female','other'),
        latitude:joi.number().required(),
        longitude:joi.number().required(),
    })
}
module.exports=Validation
