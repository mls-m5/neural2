
var canvas: HTMLCanvasElement;
var ctx: CanvasRenderingContext2D; 


function activationFunction(value: number) {
    //Logistic function //https://en.wikipedia.org/wiki/Logistic_function#Derivative
    return 1 / (1 + Math.exp(-value));
}

//This is used when 
function activationDerivative(value: number) {
	let a = activationFunction(value);
    return a * (1-a);
}


function drawCircle(x: number, y: number, radius: number) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI*2, true); 
    ctx.closePath();
    ctx.fill();
}


function drawLine(x1: number, y1: number, x2: number, y2: number) {
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}


function twoDecimals(value: number) {
    return Math.round(value * 100) / 100;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
