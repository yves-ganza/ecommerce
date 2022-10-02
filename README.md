# eCommerce web app

[Visit website](http://134.117.133.90:3000) to try it out

## How to run locally

- Clone the repo
- Install node modules: npm install
- start server: npm start
- Go to http://localhost:3000 in the browser

## Resources

- `GET /products ` fetch all products (JSON/HTML)

- `POST /products` Create a new product  
	body structure
		`{	
			name: String, 
			price: Number, 
			dimensions: {x: Number, y: Number, z: Number}, 
			stock: Number
		}`

- `GET /products/:pid` Retrieve product with product id equal to pid (serves either JSON or HTML)

- `GET /reviews/:pid` Retrieve reviews for product with id equal to pid (serves either JSON or HTML)

- `POST /reviews` Add a review for a specific product  
	body structure
		`{ id: String, review: Number(1-10) }`

- `POST /orders` Process a new order  
	body structure
	`{ author: String, products: [{ product_name: String, product_id: String, quantity: Number }] }`

- `GET /orders` Get a list of all orders
- `GET /orders/:id` Get a specific order (serves either JSON or HTML)

## Response codes

 - 200: All good
 - 201: Created
 - 404: Not found
 - 400: Bad request(could be missing body data)
 - 409: Conflict
 - 500: Unexpected server error