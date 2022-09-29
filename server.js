require('dotenv').config();

const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');

const Product = require('./models/productModel.js');
const Review = require('./models/reviewModel.js');
const Order = require('./models/orderModel.js');

const app = express();


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
	res.redirect('/products');
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

	const newProduct = {name, price, dimensions, stock};
	
	Product.create(newProduct)
	.then(p => {
		console.log(p);
		res.status(201).json(p);
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({message: 'Request failed'});
	})	
})

app.get('/reviews/:pid', (req, res) => {
	const {pid} = req.params;

	Product.findById(pid)
	.then(product => {

		if(!product){
			res.status(404).json({message: 'Product not found'});
			return
		}

		Review.find({product_id: pid})
		.then(reviews => {

			if(req.accepts('text/html')){
				res.status(200).render('reviews', {product, reviews});
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
			res.status(201).json({message: 'Thanks for the review!'});
		})
	})	
})

app.get('/orders', (req, res) => {
	Order.find({})
	.then(orders => {
		res.status(200).json({orders});
	})
	.catch(err => {
		res.status(500).json({message: 'Request failed!'})
	})
})

app.get('/orders/:id', (req, res) => {
	const {id} = req.params;

	Product.findById(id)
	.then(order => {

		if(order){
			if(req.accepts('text/html')){
				res.status(200).render('singleOrderView', {order});
				return
			}
		
			if(req.accepts('application/json')){
				res.status(200).json(order);
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

app.post('/orders', (req, res) => {
	const {author, items} = req.body;

	const stock_quantity = [];

	// Validate quantity
	items.forEach(async order_item => {
		const p = await Product.findById(order_item.product_id);
		if(!p){
			res.status(404).json({message: 'An invalid product was found in this order'});
			return
		}

		if(p.stock < order_item.quantity){
			res.status(409).json({message: 'Quantity exceeds stock'});
			return
		}

		stock_quantity.push(p.stock);
	})


	// Update database
	items.forEach(async (order_item, i) => {

		try {
			await Product.findByIdAndUpdate(order_item.product_id, { stock: stock_quantity[i]-order_item.quantity});
		}catch(e){
			res.status(500).json({message: 'Request failed!'});
			return
		}
	})

	// Create order

	Order.create({ author, products: items})
	.then(order => {
		res.status(201).json({order});
	})
	.catch(e => {
		console.log(e);
		res.status(500).json({message: 'Request failed!'});
	})
})

app.get('/cart', (req, res) => {
	res.status(200).render('cartView');
})

mongoose.connect(process.env.DB_URI)
.then(() => {
	console.log('Connected to database!');

	app.listen(3000, () =>{
		console.log('Server listening on port 3000...');
	})
})
.catch(err => {
	console.log(err.message);
})
