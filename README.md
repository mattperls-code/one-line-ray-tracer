# **One Line Ray Tracer**

##### *By Matthew Perlman*

<br/>

This program is a basic ray tracer in one line (no semicolons) of javascript.

It supports **ray casting** against triangles, **shadows**, and basic **phong shading**.

<br/>

# Setup

Pull the code

``` bash
git clone https://github.com/mattperls-code/oneLineRayTracer.git
```

Run the production build at "src/prod/index.html"

You should see the rendered ray trace image in a canvas.

<br/>

# How It Works

Using a series of callbacks and IIFEs, all of the fundamental pseudo classes and methods of the engine are created, then they are used to render a basic scene.

<br/>

# Contributing

Contributions would be greatly appreciated.

All of the development code is located at "src/dev/index.js".

Any additions should be first implemented in the dev directory, then use the page located at "util/index.html" to generate the production code.

For that page, all you need to do is paste the development code into the input bar, then paste into "src/prod/index.js".

## What You Can Help With:

* Optimizing the math (this program runs **very** slowly currently)
* Optimizing the production code generation (shorten names to decrease parse/tokenization time)
* Implementing anti-aliasing properly (currently not very well designed)
* Writing a obj/mtl file parser
* Implementing texturing
* Implementing reflection rays and incorporating them into the shader
* Implementing refraction rays and snell's law