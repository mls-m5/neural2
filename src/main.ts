/// <reference path="functions.ts"/>



class TrainingSet {
	constructor(public x: number[], public y: number[]) {

	}
}

let types = Object.freeze({
	hidden: 0,
	in: 1,
	out: 2
});



class Network {
	layers: Unit[][] = [];
	connections: Connection[] = [];
	trainingSet: TrainingSet;
	learningRate: number = .1;

	constructor() {
		this.createUnitLayers(2, 2, 3, 2);
		this.connectAllLayers();
		this.setTrainingSet(new TrainingSet(
			[1, 0],
			[1, 0]
		));
	}

	setTrainingSet(set: TrainingSet) {
		if (set.x.length != this.layers[0].length) {
			throw "Training set (x) does not match input neuron number";
		}
		else if (set.y.length != this.layers[this.layers.length - 1].length) {
			throw "Trainingset (y) does not match output neuron number";
			
		}
		this.trainingSet = set;
		for (let j in set.x) {
			this.layers[0][j].a = set.x[j];
		}
	}

	outLayer() {
		return this.layers[this.layers.length - 1];
	}

	draw() {
		clearCanvas();
		for (let c in this.connections) {
			this.connections[c].draw();
		}
		for (let l in this.layers) {
			for (let j in this.layers[l]) {
				this.layers[l][j].draw();
			}
		}
		for (let j in this.trainingSet.y) {
			//+ framför sträng konverterar till siffra
			drawCircle(this.calculateX(this.layers.length), this.calculateY(+j), this.trainingSet.y[j] * 10);
		}
	}

	calculateX(layer: number) {
		return 50 + layer * 70;
	}

	calculateY(neuron: number) {
		return 50 + neuron * 70;
	}

	createUnitLayers(inputNeurons: number, outputNeurons: number,
	layers: number, hiddenNeuronsPerLayer: number) {
		//Create layers
		for (let l = 0; l < layers; ++ l) {
			this.layers[l] = [];
		}

		//input layer
		for (let j = 0; j < inputNeurons; ++j) {
			let x = this.calculateX(0);
			let y = this.calculateY(j);
			let name = "x" + j;
			let u = new Unit(x, y, name, types.in);
			this.layers[0].push(u);
		}

		//Skips the input and output layer
		for (let l = 1; l < this.layers.length - 1; ++l) {
			this.layers[l] = <Unit[]> [];
			for (let j = 0; j < hiddenNeuronsPerLayer; ++j) {
			let x = this.calculateX(l);
			let y = this.calculateY(j);
				let name = "x";
				this.layers[l].push(new Unit(x, y, name, types.hidden));
			}
		}


		//output layer
		for (let j = 0; j < outputNeurons; ++j) {
			let x = this.calculateX(layers - 1);
			let y = this.calculateY(j);
			let name = "y" + j;
			let u = new Unit(x, y, name, types.out);
			this.layers[layers - 1].push(u);
		}
	}

	//Connect all neurons between two layers
	connectAllLayers() {
		for (let l = 0; l < this.layers.length - 1; ++l) {
			for (let j in this.layers[l]) {
				for (let k in this.layers[l + 1]) {
					this.connections.push(new Connection(this.layers[l][j], this.layers[l + 1][k]));
				}
			}
		}
	}

	calculate() {
		//Set input
		//Forward propagate (skip the input layer)
		for (let l = 1; l < this.layers.length; ++l) {
			let layer = this.layers[l];
			for (let j in layer) {
				layer[j].forward();
			}
		}
		//Output error: räkna ut för alla på utlagret
		{
			let layer = this.layers[this.layers.length - 1];
			console.log("output layer:");
			for (let j in layer) {
				layer[j].d = layer[j].a - this.trainingSet.y[j];
			}
		}
		//Backpgropagate: Räkna ut felet för resten av nätet
		{
			for (let l = this.layers.length - 2; l >= 1; --l) {
				let layer = this.layers[l];
				for (let unit of layer) {
					unit.d = 0;
					//Backpropagate value (sum how much difference this node can make)
					for (let connection of unit.to) {
						unit.d += connection.to.d * connection.weight;
					}
				}
			}
		}
		//Output: Justera värden på bias och vikter
		{
			for (let layer of this.layers) {
				for (let unit of layer) {
					unit.correctError(this.learningRate);
				}
			}
		}

		console.log(this.totalError());
	}

	totalError() {
		let error = 0;
		let outLayer = this.layers[this.layers.length - 1];
		for (let j in outLayer) {
			let d = outLayer[j].a - this.trainingSet.y[j];
			error += d * d;
		}
		return error;
	}
}




class Unit {
	bias: number = Math.random();
	from: Connection[];
	to: Connection[];

	z: number = 0; //The net sum of imput
	a: number = Math.random(); //z calculated through the activation function
	d: number = 0; //The error, written as delta in examples

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
	}

	correctError(learningRate: number) {
		if (this.type == types.hidden || this.type == types.out) {
			this.bias -= this.d * learningRate;
			//console.log(this.name + " is learning bias " + this.d * learningRate + " new = " + this.bias);
			//console.log("a = " + this.a);
		}
		if (this.type == types.hidden || this.type == types.out) {
			//	console.log(this.name + " is learning weight " + this.d * learningRate);
			for (let connection of this.from) {
				connection.weight -= this.d * connection.from.a * learningRate;
			}
		}
	}

	draw() {
		drawCircle(this.x, this.y, this.a * 10);
	}
}



class Connection {
	weight: number = Math.random() * 2 - 1;

	//The "public" in the constructor defines a variable
	constructor(public from: Unit, public to: Unit) {
		this.from.to.push(this);
		this.to.from.push(this);
	}

	draw() {
		if (this.weight > 0) {
			ctx.lineWidth = this.weight * 5;
		}
		else {
			ctx.strokeStyle = "#f00"; //Red
			ctx.lineWidth = -this.weight * 5;
		}
		drawLine(this.from.x, this.from.y, this.to.x, this.to.y);
		ctx.strokeStyle = "#000";
		ctx.lineWidth = 1;
	}
}


var network: Network;


function init() {
	canvas = <HTMLCanvasElement> document.getElementById("canvas");
	ctx = <CanvasRenderingContext2D> canvas.getContext("2d");

	network = new Network();
	network.calculate();
	network.draw();



	canvas.onclick = function() {
		//network = new Network();
		network.calculate();
		network.draw();
	}
}



