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
        return res.status(200).json({ message: 'Login successful' });
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
    console.log(user);
    user.cart.push({
        product: product,
        amount: 1
    });
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
    console.log(user);
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
    res.send(cart_items);
});

app.post('/placeorder',async(req,res)=>{
    const{email}=req.body;
    const user = await User.findOne({ email });
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
    try{const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    const cartItem = user.cart.find(item => item.product === product);
    if (!cartItem) {
        return res.status(404).json({ message: 'Product not found in cart' });
    }
    cartItem.amount++;
    await User.updateOne(
        {email: email},
        {$set: {cart: user.cart}}
    );
    res.status(200).json({ message: 'Count incremented successfully' });}
    catch (error){
        console.error(error);
    res.status(500).json({ message: 'Error incrementing count' });
    }
})
app.put('/dec', async(req, res) => {
    const { email,product } = req.body;
    try{
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const cartItem = user.cart.find(item => item.product === product);
        if (!cartItem) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }
        if(cartItem.amount>1){
            cartItem.amount--;
        }
        else{
            let i = user.cart.indexOf(cartItem);
            user.cart.splice(i,1);
        }
        
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
// Start the server
app.listen(port, () => {
    console.log("Server running at http://localhost:"+port);
});