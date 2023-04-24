const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./Models/User');
const Product = require('./Models/Product');

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
    const { email, product_id } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    console.log(user);
    user.cart.push({
        product: product_id,
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

app.get('/fromCart', async (req,res) => {
    const { email } = req.body;
    const user = await User.findOne({ email }); 
    res.send(user.cart)

})
app.post('/placeorder',async(req,res)=>{
    const{email}=req.body;
    const user = await User.findOne({ email });
    user.myorders= user.cart;
    const response = await User.updateOne(
        { email: email },
        { $set: {myorders: user.myorders} }
    ).then(result => {
        res.status(200).json({ message: 'Product added to myorders' });
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({ message: 'Error adding product to cart' });
    });
})
app.post('/inc', async(req,res) => {
    const { email,product_id } = req.body;
    try{const user = await User.findOne({ email });
    for(let i=0; i<user.cart.length; i++){
        if(user.cart[i].product_id === product_id){
            user.cart[i].amount+=1;
            break;
        }
    }
    await user.save();}
    catch (error){
        console.error(error);
    res.status(500).json({ message: 'Error incrementing count' });
    }
})
app.post('/dec', async(req, res) => {
    const { email,product_id } = req.body;
    try{
        const user = await User.findOne({ email });
        for(let i=0; i<user.cart.length; i++){
            if(user.cart[i].product_id==product_id)
                break;
        }
        if(user.cart[i]>1)
            user.cart[i].amount-=1;
        
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