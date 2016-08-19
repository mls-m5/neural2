
class Network {
	layers: Unit[][] = [];
	connections: Connection[] = [];
	trainingSet: TrainingSet;
	trainingSetCollection: TrainingSet[];
	learningRate: number = .1;

	constructor(inputs: number, outputs: number, layersCount: number, hiddenNeurons: number) {
		this.createUnitLayers(inputs, outputs, layersCount, hiddenNeurons);
		this.connectAllLayers();
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

		this.drawStatistics();
	}

	drawStatistics() {
		let error = 0;
		let setY = 50;
		let setX = this.calculateX(this.layers.length);
		let tmpX = 0;
		let outLayer = this.layers[this.layers.length - 1];
		for (let set of trainingSets) {
			tmpX = 80;
			ctx.strokeText("in (x)", setX, setY);
			for (let x of set.x) {
				ctx.strokeText("" + x, setX + tmpX, setY);
				tmpX += 80;
			}
			setY += 10;

			tmpX = 80;
			ctx.strokeText("ut", setX, setY);
			setY += 10;
			ctx.strokeText("förväntad (y)", setX, setY);
			for (let y of set.y) {
				ctx.strokeText("" + y, setX + tmpX, setY);
				tmpX += 80;
			}

			setY += 10;

			tmpX = 80;
			ctx.strokeText("faktisk (o)", setX, setY);
			for (let o of set.o) {
				ctx.strokeText("" + Math.round(o * 1000000) / 1000000, setX + tmpX, setY);
				tmpX += 80;
			}

			setY += 30;
			for (let j in set.y) {
				let d = set.y[j] - set.o[j];
				error += d * d;
			}
		}

		ctx.strokeText("totalt fel² (C): " + error, setX, setY);
		setY += 10;

		ctx.strokeText("generation: " + generation, setX, setY);
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

	setTrainingSetCollection(sets: TrainingSet[]) {
		this.trainingSetCollection = sets;
	}

	calculate() {
		if (1) {
			for (let set of this.trainingSetCollection) {
				this.resetErrors();
				this.setTrainingSet(set);
				this.calculateSingleSet();
				this.correctErrors();
			}
		}
		else {
			//This appears to be much slower
			//Even though i thought it should be much faster at first
			this.resetErrors();
			for (let set of this.trainingSetCollection) {
				this.setTrainingSet(set);
				this.calculateSingleSet();
			}
			this.correctErrors();
		}
	}

	resetErrors() {
		for (let layer of this.layers) {
			for (let unit of layer) {
				unit.resetError();
			}
		}
	}

	correctErrors() {
		for (let layer of this.layers) {
			for (let unit of layer) {
				unit.correctError(this.learningRate);
			}
		}
	}

	calculateSingleSet() {
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
			//console.log("output layer:");
			for (let j in layer) {
				let unit = layer[j];
				unit.d = (unit.a - this.trainingSet.y[j]) * unit.sigma_prim;
				this.trainingSet.o[j] = unit.a; //only for statistics
				unit.cumulateError();
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
						unit.d += connection.to.d * connection.weight * unit.sigma_prim;
					}

					unit.cumulateError();
				}
			}
		}
		//Output: Justera värden på bias och vikter
		//This is done per cycle
		// {
		// 	for (let layer of this.layers) {
		// 		for (let unit of layer) {
		// 			unit.correctError(this.learningRate);
		// 		}
		// 	}
		// }


		//console.log(this.totalError());
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

