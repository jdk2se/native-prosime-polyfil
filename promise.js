const statuses = {
	pending: 'PENDING',
	fulfilled: 'FULFILLED',
	rejected: 'REJECTED',
};

class MyPromise {
	#thenFn = () => {};
	#catchFn = () => {};
	#status = null;

	constructor(callback) {
		this.#status = statuses.pending;
		return callback(this.#resolve.bind(this), this.#reject.bind(this));
	}

	#resolve(data) {
		if (statuses.pending === this.#status) {
			this.#status = statuses.fulfilled;

			// Вызов callback в макротаске
			// А не в синхронном искольнении
			setTimeout(() => {
				try {
					this.#thenFn(data);
				} catch (err) {
					this.#status = statuses.rejected;
					this.#catchFn(err);
				}

			}, 0);
		}
	}

	#reject(err) {
		if (statuses.pending === this.#status) {
			this.#status = statuses.rejected;

			setTimeout(() => {
				return this.#catchFn(err);
			}, 0);
		}
	}

	then(onResolved, onRejected) {
		if (onResolved) {
			this.#thenFn = onResolved;
		}

		if (onRejected) {
			this.#catchFn = onRejected;
		}

		return this;
	}

	catch(onRejected) {
		return this.then(null, onRejected);
	}
}

const promiseTimeout = new MyPromise((resolve, reject) => {
	// Вызывается синхронно, а обработчики мы навешиваем позже
	// Надо что бы код проинициализировался и сначала сработали обработчики
	resolve('all is dust');
	// setTimeout(() => {
	// 	resolve("Time is over");
	// 	reject(new Error('Error'));
	// }, 1000);
});

promiseTimeout
	.then((data) => {
		console.log(data);
		throw new Error('err in then'); // Нет перехватчика
	})
	.catch((err) => console.log(err.message ? err.message : err));
