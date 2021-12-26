var width = 1000;
var height = 1000;

var borderMargin = {
    x: 0,
    y: 0
};

const canvas = document.getElementById("cvs")
const ctx = canvas.getContext("2d");

function sizeCanvas() {
    width = window.innerWidth - 2*(borderMargin.x);
    height = window.innerHeight - 2*(borderMargin.y);
    canvas.width = width;
    canvas.height = height;
}

var mouseLocation = {x: 0, y: 0, gx: 0, gy: 0};

const globalTime = 1;
let lastUpdate = 0;
let deltaTime = 0;
const substeps = 1000;

var seed = parseInt(Math.random()*10000);

function getSeed()
{
    return seed;
}

function setSeed(s)
{
    seed = s;
}

function plot(begin, end, fonction)
{
    const resolution = 100;
    const width = 400;
    const height = 100;
    const translation = {x: 450, y: 500};
    ctx.beginPath();
    ctx.moveTo(translation.x, fonction(0)+translation.y*height);
    for(let x=0; x<=1; x+=1/resolution)
    {
        ctx.lineTo(translation.x+x*width, translation.y-fonction(x*(end-begin)+begin)*height);
    }
    ctx.stroke();
    ctx.fillRect(translation.x, 200, width, 10);
}

function clamp(a, minimum, maximum)
{
    return Math.min(Math.max(a, minimum), maximum);
}

function smin(a, b, k) {
    h = clamp(0.5 + 0.5*(a-b)/k, 0.0, 1.0);
    // return Math.mix(a, b, h) - k*h*(1.0-h);
    return h*(b-a)+a - k*h*(1.0-h);
}

function smax(a, b, k) {
    h = clamp(0.5 + 0.5*(a-b)/k, 0.0, 1.0);
    // return Math.mix(a, b, h) - k*h*(1.0-h);
    return (1.0-h)*(b-a)+a + k*h*(1.0-h);
}

// float smax(float a, float b, float k) {
//     float h = clamp(0.5 + 0.5*(a-b)/k, 0.0, 1.0);
//     return mix(a, b, 1.0-h) + k*h*(1.0-h);
// }

function cavity(x)
{
    return x*x-1;
}

function rim(x)
{
    let rimX = Math.min(x-1-3, 0);
    // return 1 * rimX * rimX;
    return (Math.abs(x)-2)**2
}

function cratere(a)
{
    let x = (a-Math.PI)*4;
    let cav = cavity(x);
    let r = rim(x);
    let expo = 20*Math.exp(-Math.abs(x)-2);
    let cratereShape = smax(cav, 0.2, 0.25);
    // cratereShape = smin(cratereShape, r, 0.25);
    cratereShape = smin(cratereShape, expo, 0.25);
    return cratereShape
}

function multipleCrateres(x)
{
    // return 0.6*cratere(2*x)+0.1*Math.sin(7*x)+0.05*Math.sin(13*x);
    return 0.0*cratere(2*x)+0.1*Math.sin(10*mulberry32(seed)+7*x)+0.05*Math.sin(5*mulberry32(seed)+13*x);
}

function smoothFunc(x)
{
    let newX = 10*x;
    return smin(xsquared(newX), affine(newX), 0.25);
}

function plotOnSphere(location, radius, resolution, fonction)
{
    const scale = 50;
    ctx.beginPath();
    ctx.moveTo(location.x+radius+fonction(0)*scale, location.y);
    for(let theta=0; theta<=2*Math.PI; theta+=2*Math.PI/resolution)
    {
        value = fonction(theta);
        x = Math.cos(theta)*(radius+value*scale);
        y = Math.sin(theta)*(radius+value*scale);
        ctx.lineTo(x+location.x, y+location.y);
    }
    ctx.stroke();
    ctx.fillStyle = 'gray'
    ctx.fill();
}

function mulberry32(a) {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

function drawSky()
{
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'white';
    for(let i=0; i<200; i++)
    {
        let size = (mulberry32(seed+3*i)>0.5)*1+2;
        ctx.fillRect(mulberry32(seed+i)*width, mulberry32(seed+2*i)*height, size, size);
    }
}

function frame()
{
    deltaTime = (Date.now()-lastUpdate)/(100)*globalTime;
    ctx.clearRect(0, 0, width, height);

    drawSky();

    // plot(0, 2*Math.PI, cratere);
    // plot(-10, 10, rim);
    // plot(-10, 10, cavity);
    plotOnSphere({x: 500, y: 500}, 200, 1000, multipleCrateres);

    lastUpdate = Date.now();
    window.requestAnimationFrame(frame);
}


window.onload = () => {
    window.addEventListener("resize", sizeCanvas, false);
    sizeCanvas();

    lastUpdate = Date.now()
    window.requestAnimationFrame(frame);
};

document.addEventListener("mousemove", (evt) => {
    mouseLocation.gx = evt.clientX;
    mouseLocation.gy = evt.clientY;
    mouseLocation.x = evt.clientX - canvas.offsetLeft;
    mouseLocation.y = evt.clientY - canvas.offsetTop;
})