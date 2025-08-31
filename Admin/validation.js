const joi=require('joi');
const Validation=()=>{
    return joi.object({
        name:joi.string().required(),
        email:joi.string().required(),
        password:joi.string().required().min(8).max(100),
        resturentname:joi.string().required(),
        phonenumber:joi.string()
        .pattern(/^[6-9][0-9]{9}$/).required()
        .messages({
         'string.pattern.base': 'Phone number must be 10 digits and start with 6, 7, 8, or 9',
        'string.empty': 'Phone number is required',
        }),
    })
}
const itemsValidations=()=>{
    return joi.object({
        resturentName:joi.string().required().min(3).max(100),
        foodName:joi.string().required().min(3).max(100),
        foodType:joi.string().required().valid('vegetarian','non','softdrink','fastfood'),
        foodPrice:joi.number().required().min(0),
        foodImage:joi.string(),
        foodDescription:joi.string().required().min(100),
        lat:joi.string().required(),
        lon:joi.string().required(),
    })
}
module.exports={Validation,itemsValidations}