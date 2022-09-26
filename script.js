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
