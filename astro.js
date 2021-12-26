var width = 1000;
var height = 1000;

var borderMargin = {
    x: 50,
    y: 50
};

const canvas = document.getElementById("cvs")
const ctx = canvas.getContext("2d");

function sizeCanvas() {
    width = window.innerWidth - 2*(borderMargin.x);
    height = window.innerHeight - 2*(borderMargin.y);
    canvas.width = width;
    canvas.height = height;
}


const G = 10;
var globalTime = 1.0;

var mouseLocation = {x: 0, y: 0, gx: 0, gy: 0};

function sumForces(forces)
{
    tx = 0
    ty = 0
    for(i in forces)
    {
        let force = forces[i]
        tx+=force.x
        ty+=force.y
    }
    return {x: tx, y: ty};
}

function computeGravity(obj1, obj2)
{
    let dx = obj2.position.x - obj1.position.x
    let dy = obj2.position.y - obj1.position.y
    let distance = Math.sqrt(dx**2 + dy**2);

    F1 = G*obj1.mass*obj2.mass/(distance**2);


    return {
        x: dx/distance*F1,
        y: dy/distance*F1
    }
}

class Astre
{
    constructor(x, y, speed, acceleration, mass)
    {
        this.position = {x: x, y: y};
        
        this.speed = speed;
        this.acceleration = acceleration;

        this.size = {x: 10, y: 10};

        this.mass = mass;

        this.forces = []

        this.lastPositions = []
    }

    clearForces()
    {
        this.forces = []
    }

    addForce(force)
    {
        this.forces.push(force)
    }

    update(deltaTime)
    {
        let somme = sumForces(this.forces);
        somme.x /= this.mass;
        somme.y /= this.mass;
        this.acceleration.x = somme.x;
        this.acceleration.y = somme.y;
        this.speed.x += this.acceleration.x * deltaTime;     // dv/dt = a   <=>   dv = a*dt
        this.speed.y += this.acceleration.y * deltaTime;
        this.position.x += this.speed.x * deltaTime;
        this.position.y += this.speed.y * deltaTime;
    }
    
    draw()
    {
        this.lastPositions.push({x: this.position.x, y: this.position.y});
        ctx.beginPath()
        ctx.fillStyle = 'gray'
        if(this.lastPositions.length>0)
        {
            ctx.moveTo(this.lastPositions[0].x, this.lastPositions[0].y);
            for (i in this.lastPositions)
            {
                let pos = this.lastPositions[i]
                ctx.lineTo(pos.x, pos.y);
            }
            ctx.stroke();
        }

        ctx.beginPath()
        ctx.fillStyle = 'black'
        ctx.arc(this.position.x, this.position.y, 10, 0, 2*Math.PI, false);
        ctx.fill();

    }
}

class Arrow
{
    constructor(position, target)
    {
        this.position = {x: position.x, y: position.y};
        this.target = {x: target.x, y: target.y};
    }

    update()
    {
        this.target.x = mouseLocation.x;
        this.target.y = mouseLocation.y;
    }

    draw()
    {
        ctx.fillStyle = 'red'
        ctx.fillRect(this.position.x-2, this.position.y-2, 4, 4);
        ctx.fillRect(this.target.x-2, this.target.y-2, 4, 4);

        ctx.fillStyle = 'black'
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(this.target.x, this.target.y)
        ctx.stroke()

        // let dx = this.target.x-this.position.x;
        // let dy = this.target.y-this.position.y;
        // let angle = Math.atan(dy/dx);
        // let angleCos = Math.cos(angle);
        // let angleSin = Math.sin(angle);
        // ctx.beginPath();
        // ctx.moveTo(this.target.x, this.target.y);
        // ctx.lineTo(this.target.x-10, this.target.y+20);
        // ctx.lineTo(this.target.x+10, this.target.y+20);
        // ctx.fill();

        ctx.beginPath();

        let r = 30;
        let dx = this.target.x-this.position.x;
        let dy = this.target.y-this.position.y;
        let angle = Math.atan2(dy,dx);
        let x = this.target.x;
        let y = this.target.y;

        ctx.moveTo(x, y);

        angle += (1/2.2)*(2*Math.PI)
        x = r*Math.cos(angle) + this.target.x;
        y = r*Math.sin(angle) + this.target.y;

        ctx.lineTo(x, y);

        angle -= (2/2.2)*(2*Math.PI)
        x = r*Math.cos(angle) + this.target.x;
        y = r*Math.sin(angle) + this.target.y;

        ctx.lineTo(x, y);

        ctx.closePath();
        ctx.fill();

    }
}

var objects = []
let lastUpdate = 0;
let deltaTime = 0;
const substeps = 1000;

// arrow = new Arrow({x: 100, y: 100}, {x: 200, y: 150});
function frame()
{
    deltaTime = (Date.now()-lastUpdate)/(100)*globalTime;
    // console.log(deltaTime);
    ctx.clearRect(0, 0, width, height);

    // arrow.update();
    // arrxow.draw();

    for(let _=0; _<substeps; _++)
    {
        for(i in objects)
        {
            object = objects[i]
            object.clearForces()
            for(j in objects)
            {
                interact = objects[j]
                if(interact==object) continue;
                force = computeGravity(object, interact);
                object.addForce(force)
            }
        }
        for(i in objects)
        {
            object = objects[i]
            object.update(deltaTime/substeps)
        }
    }

    for(i in objects)
    {
        object = objects[i]
        object.draw()
    }


    lastUpdate = Date.now();

    window.requestAnimationFrame(frame);
}


window.onload = () => {
    window.addEventListener("resize", sizeCanvas, false);
    sizeCanvas();

    objects.push(new Astre(894, 500, {x: 93.24/2, y: 86.47/2}, {x: 0.0, y: 0}, 100000));
    objects.push(new Astre(797, 524.308, {x: -93.24, y: -86.47}, {x: 0.0, y: 0}, 100000));
    objects.push(new Astre(700, 548.616, {x: 93.24/2, y: 86.47/2}, {x: 0.0, y: 0}, 100000));
    // objects.push(new Astre(900, 548.616, {x: 93.24/2, y: 86.47/2}, {x: 0.0, y: 0}, 100000));
    // for(let i=0; i<=6; i++)
    // {
    //     obj = new Astre(Math.random()*800, Math.random()*800, {x: Math.random(), y: Math.random()},  {x: 0, y: 0}, Math.random()*100+10)
    //     objects.push(obj)
    // }

    lastUpdate = Date.now()
    window.requestAnimationFrame(frame);
};

document.addEventListener("mousemove", (evt) => {
    mouseLocation.gx = evt.clientX;
    mouseLocation.gy = evt.clientY;
    mouseLocation.x = evt.clientX - canvas.offsetLeft;
    mouseLocation.y = evt.clientY - canvas.offsetTop;
})


document.getElementById("timespeed").addEventListener("input", (evt) => {
    document.getElementById("timespeedlabel").innerHTML = evt.target.value+"x";
    globalTime = evt.target.value;
})