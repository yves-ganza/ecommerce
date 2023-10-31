require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const logger = require('morgan');
const passport = require('passport');
const session  = require('express-session');
const MongoStore = require('connect-mongo');

const path = require('path');

const Product = require('./models/productModel.js');
const Review = require('./models/reviewModel.js');
const Order = require('./models/orderModel.js');

const auth = require('./routes/auth.js');
const user = require('./routes/user.js');
const index = require('./routes/index.js');

const app = express();


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	store: new MongoStore({ mongoUrl: process.env.DB_URI })
}));

app.use(passport.authenticate('session'));

app.use('/', index);
app.use('/user', user);
app.use('/auth', auth);


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
	const {id, review, reviewer} = req.body;

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
			author: reviewer || 'unknown',
			product_id: product._id,
			value: review
		})
		.then(review => {
			res.status(201).json({message: 'Thanks for the review!'});
		})
	})	
})

app.get('/orders', (req, res) => {
	console.log(req.hostname, req.ip);
	Order.find({})
	.then(orders => {
		res.status(200).json(orders.map(order => {
			order.url = '/orders/'+order._id;
			return order;
		}));
	})
	.catch(err => {
		res.status(500).json({message: 'Request failed!'})
	})
})

app.get('/orders/:id', (req, res) => {
	const {id} = req.params;

	Order.findById(id)
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
			res.status(404).json({message: 'Order not found'});
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
	const validations = items.map(async order_item => {
		const p = await Product.findById(order_item.product_id);
		if(!p){
			throw new Error({status: 404, message: 'An invalid product was found in this order'});
		}

		if(p.stock < order_item.quantity){
			throw new Error({status: 409, message: 'Quantity exceeds stock'});
		}
		stock_quantity.push(p.stock);
	})

	Promise.all(validations)
	.then(v => {

		// Update database
		const updates = items.map(async (order_item, i) => {

			try {
				await Product.findByIdAndUpdate(order_item.product_id, { stock: stock_quantity[i]-order_item.quantity});
			}catch(e){
				throw new Error({status: 500, message: 'Request failed!'});
			}
		})

		Promise.all(updates)
		.then(v => {
			// Create order

			Order.create({ author, products: items})
			.then(order => {
				res.status(201).json({order});
				return
			})
			.catch(e => {
				throw new Error({status: 500, message: 'Request failed!'});
			})
		})
		.catch(err => {
			res.status(err.status).json({message: err.message});
		})
	})
	.catch(err => {
		res.status(err.status).json({message: err.message});
	})
})

app.get('/cart', (req, res) => {
	res.status(200).render('cartView');
})

app.get('/create', (req, res) => {
	res.status(200).render('createProduct')
})

mongoose.connect(process.env.DB_URI)
.then(() => {
	console.log('Connected to database!');

	app.listen(process.env.PORT, () =>{
		console.log('Server listening on port 3000...');
	})
})
.catch(err => {
	console.log(err.message);
})
