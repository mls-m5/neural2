

class Unit {
	bias: number = Math.random();
	from: Connection[];
	to: Connection[];

	z: number = 0; //The net sum of imput
	sigma_prim: number = 0;
	a: number = Math.random(); //z calculated through the activation function
	d: number = 0; //The error, written as delta in examples
	d_total: number = 0;

	constructor(public x: number, public y: number,
		public name: string, public type: number) {
		this.from = [];
		this.to = [];
	}

	forward() {
		this.z = this.bias;
		for (let j in this.from) {
			let connection = this.from[j];
			this.z += connection.weight * connection.from.a;
		}
		this.a = activationFunction(this.z);
		this.sigma_prim = activationDerivative(this.z);
	}

	correctError(learningRate: number) {
		if (this.type == types.hidden || this.type == types.out) {
			this.bias -= this.d_total * learningRate;
			//console.log(this.name + " is learning bias " + this.d * learningRate + " new = " + this.bias);
			//console.log("a = " + this.a);
		}
		if (this.type == types.hidden || this.type == types.out) {
			//	console.log(this.name + " is learning weight " + this.d * learningRate);
			for (let connection of this.from) {
				connection.weight -= this.d_total * connection.from.a * learningRate;
			}
		}
	}

	//Save the error to make a average over all training sets
	cumulateError() {
		this.d_total += this.d;
	}

	resetError() {
		this.d_total = 0;
	}

	draw() {
		drawCircle(this.x, this.y, this.a * 10);
	}
}

