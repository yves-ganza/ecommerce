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