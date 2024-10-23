const express = require("express");
const mongoose = require("mongoose");

// connection to mongodb
mongoose
    .connect("mongodb://localhost:27017/productsCollection")
    .then(() => console.log("Connected to MongoDB..."))
    .catch((err) => console.error("Could not connect to MongoDB...", err));

// making a product schema
const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is Mandatory"],
            minLength: 3,
            maxLength: 30,
        },
        price: {
            type: Number,
            required: [true, "Price is Mandatory"],
            min: [0, "Price cannot be negative"],
        },
        category: {
            type: String,
            required: [true, "Category is Mandatory"],
            enum: ["electronics", "clothing", "books"],
        },
    },
    { timestamps: true }
);

// creating a Product Model
const productModel = mongoose.model("Product", productSchema);

// creating a server
const app = express();

// middleware to parse the body of the request
app.use(express.json());

// endpoint to post a product
app.post('/products', (req, res)=>{
       productModel.create(req.body)
       .then((product)=>{
        res.status(201).send(product)
       })
       .catch((err)=>{
        res.status(400).send(err.message)
       })
})

// endpoint to get all products
app.get('/products', (req, res)=>{
    productModel.find({})
    .then((products)=>{
        res.send(products)
    })
    .catch((err)=>{
        res.status(500).send(err.message)
    })
})

// endpoint to get a single products
app.get('/products/:id', (req, res)=>{
    productModel.findOne({_id: req.params.id})
    .then((product)=>{
        if(product){
            res.send(product)
        }else{
            res.status(404).send("Product not found")
        }
    })
    .catch((err)=>{
        res.status(500).send(err.message)
    })
})

// endpoint to delete a product
app.delete('/products/:id', (req, res)=>{
    productModel.deleteOne({_id: req.params.id})
    .then((product)=>{
        if(product){
            res.send(product)
        }else{
            res.status(404).send("Product not found")
        }
    })
    .catch((err)=>{
        res.status(500).send(err.message)
    })
})

// endpoint to update a product
app.put('/products/:id', (req, res)=>{
    productModel.updateOne({_id: req.params.id}, req.body)
    .then((product)=>{
        if(product){
            res.send(product)
        }else{
            res.status(404).send("Product not found")
        }
    })
    .catch((err)=>{
        res.status(500).send(err.message)
    })
})

app.listen(8000, () => {
    console.log("Server is running on port 8000");
});