const canvas = document.getElementById("cvs")
const gl = canvas.getContext("webgl");

if(!gl)
{
    alert("No webgl");
}

gl.clearColor(0.2, 0.2, 0.2, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT)