
import express from "express";
import bcrypt from "bcryptjs";
import { Category, Order, Product, Seller, User } from "./models.js";

const router = express.Router();
const mapSeller = s => s ? ({id:s.sellerId,name:s.name,nameBn:s.nameBn,area:s.area,rating:s.rating,isLocal:s.isLocal,verified:s.verified,since:s.since,responseTime:s.responseTime}) : null;
const mapCategory = c => ({id:c.categoryId,name:c.name,nameBn:c.nameBn,emoji:c.emoji});
const mapProduct = p => ({id:p.productId,name:p.name,nameBn:p.nameBn,brand:p.brand,category:p.category,image:p.image,emoji:p.emoji,price:p.price,oldPrice:p.oldPrice,rating:p.rating,reviewCount:p.reviewCount,description:p.description,descriptionBn:p.descriptionBn,specs:p.specs,offers:p.offers,reviews:p.reviews,aiSummary:p.aiSummary,tags:p.tags});
const mapUser = u => ({id:u.userId,name:u.name,email:u.email,role:u.role,coins:u.coins,wishlist:u.wishlist,viewed:u.viewed,phone:u.phone,area:u.area});

router.get("/health", async (_req,res)=>res.json({ok:true,service:"hyperlocal-backend"}));

router.get("/categories", async (_req,res,next)=>{try{res.json((await Category.find().sort({name:1})).map(mapCategory));}catch(e){next(e)}});
router.get("/sellers", async (_req,res,next)=>{try{res.json((await Seller.find()).map(mapSeller));}catch(e){next(e)}});
router.get("/sellers/:id", async (req,res,next)=>{try{const s=await Seller.findOne({sellerId:req.params.id});if(!s)return res.status(404).json({message:"Seller not found"});res.json(mapSeller(s));}catch(e){next(e)}});

router.get("/products", async (req,res,next)=>{
  try {
    const {q="",category,maxPrice,minRating=0,localOnly="false",sort="relevance"}=req.query;
    const sellers = await Seller.find({isLocal:true},{sellerId:1});
    const localIds=new Set(sellers.map(s=>s.sellerId));
    let items=await Product.find();
    const term=String(q).trim().toLowerCase();
    items=items.filter(p=>{
      const text=[p.name,p.nameBn,p.brand,p.category,...(p.tags||[])].join(" ").toLowerCase();
      const match=!term || text.includes(term) || term.split(/\s+/).some(w=>w.length>3&&text.includes(w));
      const cat=!category || p.category===category;
      const price=maxPrice==null || Number(maxPrice)>=p.price;
      const rating=p.rating>=Number(minRating||0);
      const local=localOnly!=="true" || p.offers.some(o=>localIds.has(o.sellerId));
      return match&&cat&&price&&rating&&local;
    });
    if(sort==="price-asc")items.sort((a,b)=>a.price-b.price);
    if(sort==="price-desc")items.sort((a,b)=>b.price-a.price);
    if(sort==="rating")items.sort((a,b)=>b.rating-a.rating);
    res.json({items:items.map(mapProduct),total:items.length});
  }catch(e){next(e)}
});
router.get("/products/:id", async (req,res,next)=>{try{const p=await Product.findOne({productId:req.params.id});if(!p)return res.status(404).json({message:"Product not found"});res.json(mapProduct(p));}catch(e){next(e)}});
router.get("/products/:id/reviews", async (req,res,next)=>{try{const p=await Product.findOne({productId:req.params.id});if(!p)return res.status(404).json({message:"Product not found"});res.json(p.reviews||[]);}catch(e){next(e)}});

router.get("/recommendations", async (req,res,next)=>{
  try {
    const user=req.query.userId?await User.findOne({userId:req.query.userId}):null;
    const products=await Product.find();
    const viewed=new Set(user?.viewed||[]);
    const wishlist=new Set(user?.wishlist||[]);
    const scored=products.map(p=>({p,score:(p.tags||[]).includes("trending")?3:0+(wishlist.has(p.productId)?3:0)+(viewed.has(p.productId)?1:0)+(p.rating||0)}))
      .sort((a,b)=>b.score-a.score).map(x=>mapProduct(x.p));
    res.json(scored);
  }catch(e){next(e)}
});

router.get("/demo-user", async (_req,res,next)=>{
  try { let u=await User.findOne({userId:"u-demo"}); if(!u){u=await User.create({userId:"u-demo",name:"Ayesha Rahman",email:"ayesha.r@example.com",role:"customer"});} res.json(mapUser(u)); }
  catch(e){next(e)}
});
router.get("/users/:id", async (req,res,next)=>{try{const u=await User.findOne({userId:req.params.id});if(!u)return res.status(404).json({message:"User not found"});res.json(mapUser(u));}catch(e){next(e)}});
router.post("/users/:id/viewed", async (req,res,next)=>{try{const u=await User.findOne({userId:req.params.id});if(!u)return res.status(404).json({message:"User not found"});u.viewed=[req.body.productId,...u.viewed.filter(x=>x!==req.body.productId)].slice(0,8);await u.save();res.json({viewed:u.viewed});}catch(e){next(e)}});
router.post("/users/:id/wishlist", async (req,res,next)=>{try{const u=await User.findOne({userId:req.params.id});if(!u)return res.status(404).json({message:"User not found"});const id=req.body.productId;u.wishlist=u.wishlist.includes(id)?u.wishlist.filter(x=>x!==id):[...u.wishlist,id];await u.save();res.json({wishlist:u.wishlist});}catch(e){next(e)}});
router.get("/users/:id/cart", async (req,res,next)=>{try{const u=await User.findOne({userId:req.params.id});if(!u)return res.status(404).json({message:"User not found"});res.json(u.cart||[])}catch(e){next(e)}});
router.put("/users/:id/cart", async (req,res,next)=>{try{const u=await User.findOne({userId:req.params.id});if(!u)return res.status(404).json({message:"User not found"});u.cart=req.body.items||[];await u.save();res.json(u.cart)}catch(e){next(e)}});

router.post("/auth/register", async (req,res,next)=>{
  try {const {name,email,password,role="customer"}=req.body;if(!name||!email||!password)return res.status(400).json({message:"Name, email and password are required"});if(await User.findOne({email}))return res.status(409).json({message:"Email already registered"});const u=await User.create({userId:"u-"+Date.now(),name,email,passwordHash:await bcrypt.hash(password,10),role});res.status(201).json({user:mapUser(u)})}catch(e){next(e)}
});
router.post("/auth/login", async (req,res,next)=>{
  try {const {email,password}=req.body;const u=await User.findOne({email});if(!u||!u.passwordHash||!(await bcrypt.compare(password,u.passwordHash)))return res.status(401).json({message:"Invalid email or password"});res.json({user:mapUser(u)})}catch(e){next(e)}
});

router.post("/orders", async (req,res,next)=>{
  try {
    const {userId,items=[],total,payment,seller}=req.body;
    if(!userId||!items.length)return res.status(400).json({message:"userId and items are required"});
    const user=await User.findOne({userId});if(!user)return res.status(404).json({message:"User not found"});
    const orderId="HL-"+Math.floor(2300+Math.random()*700);
    const order=await Order.create({orderId,userId,items,total,payment,status:0,seller,date:new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})});
    user.cart=[];user.coins+=(Math.round(Number(total)/50));await user.save();
    res.status(201).json(order);
  }catch(e){next(e)}
});
router.get("/users/:id/orders", async (req,res,next)=>{try{res.json(await Order.find({userId:req.params.id}).sort({createdAt:-1}))}catch(e){next(e)}});

router.post("/ai/assistant", async (req,res,next)=>{
  try{
    const q=String(req.body.message||"").toLowerCase();
    if(q.includes("order")||q.includes("track"))return res.json({reply:"I can track your saved orders. Open Orders to see the latest status and seller information."});
    if(q.includes("review")||q.includes("fake")||q.includes("trust"))return res.json({reply:"The product review data includes suspicious-review flags and reasons. Open a product and choose the reviews section to inspect them."});
    if(q.includes("gift")||q.includes("budget")||q.includes("under"))return res.json({reply:"For a budget recommendation, tell me the maximum amount and the category you want."});
    const p=await Product.findOne({$or:[{name:{$regex:q,"i"}},{brand:{$regex:q,"i"}},{category:{$regex:q,"i"}}]});
    if(p)return res.json({reply:`${p.name} starts at ৳${Math.min(...p.offers.map(o=>o.price))} across ${p.offers.length} sellers, rated ${p.rating}★. ${p.aiSummary}`});
    res.json({reply:"I can compare seller prices, explain review flags, help with order tracking, and recommend products from the marketplace."});
  }catch(e){next(e)}
});

router.post("/products/:id/reviews", async (req,res,next)=>{
  try{
    const p=await Product.findOne({productId:req.params.id});if(!p)return res.status(404).json({message:"Product not found"});
    const review={id:"r-"+Date.now(),user:req.body.user||"Customer",rating:Number(req.body.rating||5),text:String(req.body.text||""),date:"just now"};
    p.reviews.push(review);p.reviewCount+=1;p.rating=Number(((p.reviews.reduce((s,r)=>s+r.rating,0))/p.reviews.length).toFixed(1));await p.save();res.status(201).json(review);
  }catch(e){next(e)}
});

router.get("/sellers/:id/products", async (req,res,next)=>{try{const ps=await Product.find({"offers.sellerId":req.params.id});res.json(ps.map(mapProduct))}catch(e){next(e)}});

export default router;
