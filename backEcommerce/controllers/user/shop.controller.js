const Shop = require("../../models/shop.model");


const getShop =  async(req, res) => {
    try{
      const shop = await Shop.find();
      console.log(shop)
        res.status(200).json({success:true, data:shop?.[0]});
    }
    catch(err){
        res.status(500).json({message:err?.message || "Internal Server Error"})
    }
};


module.exports = {getShop};
