const express = require('express');
const crypto = require('crypto');
const app = express();

const products = require('./public/products.json');
const reviews = {};

app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.json());

app.get('/', (req, res) => {
	res.render('index', {title: "ecommerce", message: "Welcome to our eCommerce store!"});
})

app.get('/products', (req, res) => {
	const { name, instock } = req.query;
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

app.get('/products/:pid', (req, res) => {
	const {pid} = req.params;

	const product = products.find(p => p.id == pid);

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


app.get('/reviews/:pid', (req, res) => {
	const {pid} = req.params;
	const product = products.find(p => p.id == pid);

	if(!product){
		res.status(404).json({message: 'Product not found'});
	}

	if(req.accepts('text/html')){
		res.status(200).render('reviews', {product, reviews: reviews[pid]});
		return
	}

	if(req.accepts('application/json')){
		res.status(200).json(reviews[pid]);
		return
	}
})

app.post('/reviews', (req, res) => {
	const {id, review} = req.body;

	console.log(req.body);

	if(!id || !review){
		res.status(400).json({message: 'Bad request'});
		return
	}

	if(reviews[id]){
		reviews[id].push({stamp: Date.now(), review});
	}
	
	else{
		reviews[id] = [{stamp: Date.now(), review}];
	}

	res.status(200).json(reviews);
})

app.post('/products', (req, res) => {
	const {name, price, dimensions, stock} = req.body;

	if(!name || !price || !dimensions || !stock){
		res.status(400).json({message: 'Bad request'});
		return
	}
	
	if(data){
		const newProduct = {name, price, dimensions, stock, id: crypto.randomUUID()};
		products.push(newProduct);
		res.status(200).json(newProduct);
		return;
	}
	
	res.status(400).json({message: 'Bad request'});
})


app.listen(3000, () =>{
	console.log('Server listening on port 3000...');
})