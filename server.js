require('dotenv').config();

const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Product = require('./models/productModel.js');
const Review = require('./models/reviewModel.js');

const app = express();

app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.json());

app.get('/', (req, res) => {
	res.render('index', {title: "ecommerce", message: "Welcome to our eCommerce store!"});
})

app.get('/products', (req, res) => {
	const { name, instock } = req.query;

	Product.find({})
	.then(products => {

		let filteredProducts = [...products];
	
		const searchEx = new RegExp("\\b" + name + "\\b",'i');
	
		if(name){
			filteredProducts = filteredProducts.filter(p => searchEx.test(p.name));
		}
	
		if(instock){
			filteredProducts = filteredProducts.filter(p => p.stock > 0);
		}
	
		if(req.accepts('text/html')){
			res.status(200).render('productsView', {products: filteredProducts});
			return
		}
		
		if(req.accepts('application/json')){
			res.status(200).json(filteredProducts);
			return
		}
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({message: 'Request not completed'});
	})	
})

app.get('/products/:pid', (req, res) => {
	const {pid} = req.params;

	Product.findById(pid)
	.then(product => {

		if(product){
			if(req.accepts('text/html')){
				res.status(200).render('singleProductView', {product});
				return
			}
		
			if(req.accepts('application/json')){
				res.status(200).json(product);
				return
			}
		}
		else{
			res.status(404).json({message: 'product not found'});
		}
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({message: 'Request not completed'});
	})	
})

app.post('/products', (req, res) => {
	const {name, price, dimensions, stock} = req.body;

	if(!name || !price || !dimensions || !stock){
		res.status(400).json({message: 'Bad request'});
		return
	}

	const newProduct = {name, price, dimensions, stock, id: crypto.randomUUID()};
	
	Product.create(newProduct)
	.then(p => {
		console.log(p);
		res.status(200).json(p);
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({message: 'Request not completed'});
	})	
})

app.get('/reviews/:pid', (req, res) => {
	const {pid} = req.params;
	const product = products.find(p => p.id == pid);

	Product.findById(pid)
	.then(product => {

		if(!product){
			res.status(404).json({message: 'Product not found'});
			return
		}

		Review.find({product_id: pid})
		.then(reviews => {

			if(req.accepts('text/html')){
				res.status(200).render('reviews', {product, reviews: reviews[pid]});
				return
			}
		
			if(req.accepts('application/json')){
				res.status(200).json(reviews[pid]);
				return
			}
		})
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({message: 'Request not completed'});
	})	
})

app.post('/reviews', (req, res) => {
	const {id, review} = req.body;

	if(!id || !review){
		res.status(400).json({message: 'Bad request'});
		return
	}

	Product.findById(id)
	.then(product => {

		if(!product){
			res.status(404).json({message: 'Product not found'});
			return
		}

		Review.create({
			author: 'unknown',
			product_id: product._id,
			value: review
		})
		.then(review => {
			console.log(review);
			res.status(200).json({message: 'Thanks for the review!'});
		})
	})	
})

app.get('/create', (req, res) => {
	res.status(200).render('createProduct');
})

mongoose.connect(process.env.DB_URI)
.then(() => {
	console.log('Connected to database!');

	app.listen(3000, () =>{
		console.log('Server listening on port 3000...');
	})
})
