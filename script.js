const formElements = document.getElementsByClassName('review-form');
Array.prototype.forEach.call(
	formElements, 
	el => el.addEventListener('submit', e => {
		e.preventDefault();

		const value = e.target.getElementsByClassName('review-input')[0].value;
		console.log(value);
		fetch('/reviews', { 
			method: 'POST', 
			body: JSON.stringify({id: e.target.id, review: value}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
		.then(res => {
			if(res.ok){
				alert('Thanks for the review!')
			}
		})
		.catch(e => {
			console.log(e)
		})
	})
)

const orderForms = document.getElementsByClassName('order-form');
Array.prototype.forEach.call(orderForms, form => form.addEventListener('submit', e => {
	e.preventDefault();
	const formData = new FormData(e.target);

	const orderItem = {};
	for(let [key, value] of formData){
		orderItem[key] = value;
	}
	orderItem.quantity = Number(orderItem.quantity);

	const cart = localStorage.cart || '{}';
	const products = JSON.parse(cart);

	products[orderItem.product_id] = orderItem;
	localStorage.cart = JSON.stringify(products);
	alert('Item added to cart');
}))


const createProductForm = document.getElementById('create-product-form');
if(createProductForm){
	createProductForm.addEventListener('submit', e => {
		e.preventDefault();

		const formData = new FormData(e.target);

		const obj = {};
		for(let [key, value] of formData){
			obj[key] = value;
		}

		const productData = {
			name: obj.name,
			price: Number(obj.price),
			dimensions: {
				x: Number(obj.x),
				y: Number(obj.y),
				z: Number(obj.z)
			},
			stock: Number(obj.stock)
		};


			fetch('/products', { 
				method: 'POST', 
				body: JSON.stringify(productData),
				headers: {
					'Content-Type': 'application/json'
				}
			})
			.then(res => {
				if(res.ok){
					alert('Product added successfully');
				}
			})
			.catch(e => {
				console.log(e);
			})
		console.log(productData);
	})
}

const renderCart = () => {
	const  cartView = document.getElementById('cart-items');
	if(!cartView) return;

	const cart = localStorage.cart;

	if(!cart){
		cartView.innerHTML = 'No items in cart!';
		return
	}

	const products = JSON.parse(cart);
	Object.keys(products).forEach(k => {
		const {product_name, quantity} = products[k];
		const li = document.createElement('li');
		li.innerText = quantity + ' ' + product_name;
		cartView.append(li);
	})
}

renderCart();

const placeOrderForm = document.getElementById('place-order-form');
placeOrderForm.addEventListener('submit', e => {
	e.preventDefault();

	const cart = localStorage.cart;
	if(!cart){
		alert('No items in cart!');
		return
	}

	const products = JSON.parse(cart);
	console.log(products);

	const formData = new FormData(e.target);

	const obj = {};
	for(let [key, value] of formData){
		obj[key] = value;
	}

	const requestObj = {
		author: obj['author-name'],
		items: []
	};

	Object.keys(products).forEach(key => {
		requestObj.items.push(products[key]);
	});

	fetch('/orders', {
		method: 'POST',
		body: JSON.stringify({...requestObj}),
		headers: {
			'Content-Type': 'application/json'
		}
	})
	.then(res => {
		if(res.status == 201){
			console.log(res);
			alert('Order placed successfully');
			localStorage.setItem('cart', '{}');
		}
	})
	.catch(err => {
		alert(err.message);
	})
})