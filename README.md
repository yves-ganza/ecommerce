# eCommerce web app

## How to use the repo

- Clone the repo
- Install node modules: npm install
- start server: npm start
- Go to http://localhost:3000 in the browser

## Resources

- GET /products  fetch all products (JSON/HTML)

- GET /create fetch UI for creating a new product

- POST /products Create a new product
	body structure => {name: String, price: Number, dimensions: {x: Number, y: Number, z: Number}, stock: Number}

- GET /products/:pid fetch product with product id equal to pid (JSON/HTML)

- GET /reviews/:pid fetch reviews for product with id equal to pid (JSON/HTML)

- POST /reviews Add a review for a specific product
	body structure => {id: String, review: Number(1-10)}

## Response codes

 - 200: All good
 - 404: Not found
 - 400: Bad request(could be missing body data)
 - 500: Unexpected server error