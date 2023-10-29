const reviewFormElements = document.getElementsByClassName('review-form');
const placeOrderForm = document.getElementById('place-order-form');

Array.prototype.forEach.call(
reviewFormElements, 
	el => el.addEventListener('submit', e => {
		e.preventDefault();
		const formData = new FormData(e.target);

		const reviewObj = {};
		for(let [key, value] of formData){
			reviewObj[key] = value;
		}
		
		fetch('/reviews', { 
			method: 'POST', 
			body: JSON.stringify({id: reviewObj['product_id'], review: reviewObj.rating, reviewer: reviewObj.reviewer}),
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
	orderItem.price = Number(orderItem.price);

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

const clearCartButton = document.getElementById('clear-cart-btn');
if(clearCartButton){
	clearCartButton.addEventListener('click', e => {
		localStorage.removeItem('cart');
		window.location.reload();
	})
}


const renderCart = () => {
	const  cartView = document.getElementById('cart-items');
	if(!cartView) return;

	const cart = localStorage.cart;

	if(!cart){
		placeOrderForm.setAttribute('hidden', '');
		cartView.innerHTML = 'No items in cart!';
		return
	}

	let cartSubtotal = 0;
	const products = JSON.parse(cart);
	Object.keys(products).forEach(k => {
		const {product_name, quantity, price} = products[k];
		const subtotal = price*quantity;
		cartSubtotal += subtotal;

		const li = document.createElement('li');
		li.innerText = product_name + ' ($' + price +' /unit) - Qty: ' + quantity;
		cartView.append(li);
	})
	const orderTotalEl = document.getElementById('order-total');
	orderTotalEl.innerText = cartSubtotal;
}

renderCart();

if(placeOrderForm){
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
				localStorage.removeItem('cart');
				window.location.reload();
			}
		})
		.catch(err => {
			alert(err.message);
		})
	})
}

const registerForm = document.getElementById('register-form');
if(registerForm){
	registerForm.addEventListener('submit', e => {
		e.preventDefault();
		const formData = new FormData(e.target);
		const jsonData = {};
	
		formData.forEach((value, key) => {
			jsonData[key] = value;
		});
	
		fetch('/user/register', {
			method: 'POST',
			body: JSON.stringify(jsonData),
			headers: {
				'Content-Type': 'application/json'
			}
		})
		.then(res => {
			if(res.ok){
				alert("Registration successfull!");
				res.redirect('/');
			} else {
				return res.json();
			}
		})
		.then(data => {
			alert(data.error);
		}).catch(err => {
			console.log(err);
			alert("An error has occured. Please try again!");
		})
	})
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
	loginForm.addEventListener('submit', e => {
		e.preventDefault();

		const formData = new FormData(e.target);
		const jsonData = {};
		
		formData.forEach((value, key) => {
			jsonData[key] = value;
		})

		fetch(
			'/auth/login',
			{
				method: 'POST',
				body: JSON.stringify(jsonData),
				headers: {
					'Content-Type': 'application/json'
				}
			}
		).then(res => {
			console.log(res);
			if(res.url == window.location.href){
				alert("Authentication failed!");
			}else{
				window.location.href = res.url;
			}
		}).catch(err => {
			console.log(err);
			alert("Something went wrong!");
		})
	})
}