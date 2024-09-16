/// <reference path="functions.ts"/>
/// <reference path="unit.ts"/>


class TrainingSet {
	x: number[];
	y: number[];
	o: number[]; //Used for statistics
	constructor(values: number[][]) {
		this.x = values[0];
		this.y = values[1];
		this.o = [];
	}
}

let types = Object.freeze({
	hidden: 0,
	in: 1,
	out: 2
});



class Connection {
	weight: number = Math.random() * 2 - 1;

	//The "public" in the constructor defines a variable
	constructor(public from: Unit, public to: Unit) {
		this.from.to.push(this);
		this.to.from.push(this);
	}

	draw() {
		if (this.weight > 0) {
			ctx.lineWidth = this.weight * 2;
		}
		else {
			ctx.strokeStyle = "#f00"; //Red
			ctx.lineWidth = -this.weight * 2;
		}
		drawLine(this.from.x, this.from.y, this.to.x, this.to.y);
		ctx.strokeStyle = "#000";
		ctx.lineWidth = 1;
	}
}


var network: Network;

var standardInputs = [
	[0, 0],
	[0, 1],
	[1, 0],
	[1, 1]
];

var alternativeTrainingSets = {
	"count": [
		[[0, 0], [0, 1]],
		[[0, 1], [1, 0]],
		[[1, 0], [1, 1]],
		[[1, 1], [0, 0]],
	].map(function (row) {
		return new TrainingSet(row);
	}),
	"and": standardInputs.map(function (x) {
		return new TrainingSet([x, [x[0] && x[1]]]);
	}),
	"or": standardInputs.map(function (x) {
		return new TrainingSet([x, [x[0] || x[1]]]);
	}),
	"xor": standardInputs.map(function (x) {
		return new TrainingSet([x, [x[0] ? x[1] : x[1]]]);
	})
};


var trainingSets = alternativeTrainingSets["count"];

var generation = 0;
var running = true;
var layersCount = 5;
var hiddenNeurons = 5;

function createNewNetwork() {
	network = new Network(trainingSets[0].x.length, trainingSets[0].y.length, layersCount, hiddenNeurons);
	network.setTrainingSetCollection(trainingSets);
	network.draw();
}

function setNumberOfLayers(layers: number) {
	layersCount = layers;
	createNewNetwork();
}

function setNumberOfNeurons(neurons: number) {
	hiddenNeurons = neurons;
	createNewNetwork();
}

function setTrainingSets(setName: string) {
	trainingSets = alternativeTrainingSets[setName];
	createNewNetwork();
}

function start() {
	running = true;

	var calculate = function () {
		for (let i = 0; i < 100; ++i) {
			network.calculate();

			++generation;
		}

		let cumulatedError = network.totalError();

		console.log("mean error: " + cumulatedError / 4 + " generation: " + generation);
		network.draw();

		if (running) {
			setTimeout(calculate, 10); //Prevent browser from locking up
		}
	}

	calculate();
}

function stopSteps(): void {
	running = false;
}

function init() {
	canvas = <HTMLCanvasElement>document.getElementById("canvas");
	ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
	ctx.lineCap = "round";

	createNewNetwork();
}



