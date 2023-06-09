const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./Models/User');
const Product = require('./Models/Product');
const Noti = require('./Models/Notifications')

const app = express();
const port = 3000;

// Connect to MongoDB using Mongoose
mongoose.connect('mongodb+srv://nithinantjo823:nithin2001@shop.k9po0z5.mongodb.net/test', { useNewUrlParser: true, useUnifiedTopology: true });


// Set up middleware to parse JSON data in the request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/addProduct', async (req, res) => {
    const { name, price, amount, image } = req.body;
    try {
        const product = await Product.create({ name: name, price: price, amount: amount, image: image })
        res.send(product);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Define a route for handling POST requests to the signup page
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    console.log(req.body);
    try {
        const user = await User.create({ name: name, email: email, password: password })
        res.send(user);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/login',async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const match = await password === user.password;
        if (!match) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        res.send(user.name);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/addCart', async (req, res) => {
    const { email, product } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    var name = product;
    const prod = await Product.findOne({name})
    user.cart.push({
        product: product,
        amount: 1
    });
    prod.carted.push(
        {
            email: email,
            count: 1
        }
    );
    await Product.updateOne(
        {name: name},
        {$set: {carted: prod.carted}}
    )
    const response = await User.updateOne(
        { email: email },
        { $set: {cart: user.cart} }
    ).then(result => {
        res.status(200).json({ message: 'Product added to cart' });
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({ message: 'Error adding product to cart' });
    });
});

app.post('/fromCart', async (req,res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    let cart_items = [];
    for(let i=0; i<user.cart.length; i++){
        var prod_id = user.cart[i].product;
        const prod = await Product.findOne({"name":prod_id});
        cart_items.push({
            product: prod,
            count: user.cart[i].amount
        });
    } 
    res.send(cart_items);
});

app.post('/myorders', async (req,res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    console.log(user);
    let order_items = [];
    for(let i=0; i<user.myorders.length; i++){
        var prod_id = user.myorders[i].product;
        const prod = await Product.findOne({"name":prod_id});
        order_items.push({
            product: prod,
            count: user.myorders[i].amount
        });
    } 
    res.send(order_items);
});

app.post('/placeorder',async(req,res)=>{
    const{email}=req.body;
    const user = await User.findOne({ email });
    for(let i=0; i<user.cart.length; i++){
        const name = user.cart[i].product;
        const prod = await Product.findOne({name});
        let j=0;
        while(prod.carted[j].email!=email){
            j++;
        }
        prod.carted.splice(j,1);
        await Product.updateOne(
            {name: name},
            {$set: {carted: prod.carted}}
        );
    }
    user.myorders= user.cart;
    const noti = await Noti.create({ email: email });
    noti.products = user.myorders;
    user.cart=[];
    const response = await User.updateOne(
        { email: email },
        { $set: {myorders: user.myorders,
        cart:user.cart} }
    );
    await Noti.updateOne(
        {email: email},
        {$set: {products: noti.products}}
    ).then(result => {
        res.status(200).json({ message: 'Product added to myorders' });
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({ message: 'Error adding product to cart' });
    });
})
app.put('/inc', async(req,res) => {
    const { email,product } = req.body;
    const name = product;
    try{const user = await User.findOne({ email });
    const prod = await Product.findOne({name})
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    const cartItem = user.cart.find(item => item.product === product);
    const prodItem = prod.carted.find(item => item.email === email);
    if (!cartItem) {
        return res.status(404).json({ message: 'Product not found in cart' });
    }
    cartItem.amount++;
    prodItem.count++;
    await User.updateOne(
        {email: email},
        {$set: {cart: user.cart}}
    );
    await Product.updateOne(
        {name: name},
        {$set: {carted: prod.carted}}
    );
    res.status(200).json({ message: 'Count incremented successfully' });}
    catch (error){
        console.error(error);
    res.status(500).json({ message: 'Error incrementing count' });
    }
})
app.put('/dec', async(req, res) => {
    const { email,product } = req.body;
    const name = product;
    try{
        const user = await User.findOne({ email });
        const prod = await Product.findOne({name});
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const cartItem = user.cart.find(item => item.product === product);
        const prodItem = prod.carted.find(item => item.email === email);
        if (!cartItem) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }
        if(cartItem.amount>1){
            cartItem.amount--;
            prodItem.count--;
        }
        else{
            let i = user.cart.indexOf(cartItem);
            let j = prod.carted.indexOf(prodItem);
            user.cart.splice(i,1);
            prod.carted.splice(j,1);
        }
            await Product.updateOne(
                {name: name},
                {$set: {carted: prod.carted}}
            );
            await User.updateOne(
                {email: email},
                {$set: {cart: user.cart}}
            );
    }
    catch (error){
console.error(error);
    res.status(500).json({ message: 'Error incrementing count' });
    }    
})

app.get('/notifications', async (req,res) => {
    try{
        const noti = await Noti.find({}, 'email');
        res.status(200).json(noti);
    }
    catch(error){
        console.error(error);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
})

app.post('/eachNoti', async (req,res) => {
    try{
        const {email} = req.body;
        const noti = await Noti.findOne({email});
        let noti_prods = [];
        for(let i=0; i<noti.products.length; i++){
            noti_prods.push({
                prod_name: noti.products[i].product,
                count: noti.products[i].amount
            })
        }
        res.send(noti_prods);
    }
    catch(err){
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
})

app.get('/allproducts', async (req,res) => {
    try{
        const count = await Product.countDocuments();
    const randomIndexes = [];
    while (randomIndexes.length < 1) {
      const randomIndex = Math.floor(Math.random() * count);
      if (!randomIndexes.includes(randomIndex)) {
        randomIndexes.push(randomIndex);
      }
    }
    const products = await Product.find().skip(randomIndexes[0]).limit(20);

    res.json(products);
    }
    catch(error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching products' });   
    }
})

app.post('/eachproduct', async (req,res) => {
    try{const {item} = req.body;
    var name = item;
    var resp = await Product.findOne({name})
    res.send(resp);}
    catch(error){
        console.error(error);
        res.status(500).json({ message: 'Error fetching products' });
    }
})

app.post('/products', async (req, res) => {
    const { prefix } = req.body;
  
    try {
      // Query the database for products starting with the given prefix
      const products = await Product.find({ name: { $regex: `^${prefix}`, $options: 'i' } });
  
      res.json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error retrieving products' });
    }
  });

  app.post('/confirmnoti', async (req,res) => {
    const {email} = req.body;
    try{
        const noti = await Noti.findOneAndRemove({email});
        res.send({message: "Done"});
    }
    catch(error){
        console.error(error);
        res.status(500).json({ message: 'Error removing notis' });
    }
  })

  app.post('/removeprod', async (req,res) => {
    const {name} = req.body;
try{    await Product.findOneAndRemove({name});
    res.send({message: "Done"});}
    catch(error){
        console.error(error);
        res.status(500).json({ message: 'Error removing prod' });
    }
  })
// Start the server
app.listen(port, () => {
    console.log("Server running at http://localhost:"+port);
});