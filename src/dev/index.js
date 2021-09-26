/*
    Copyright © Matthew Perlman 2021

    Matthew Perlman
    Created 9/25/21

    Ray Tracer in JavaScript

    This program is a function basic ray tracer and can be condensed to one line of javascript not including semicolons
*/

[
    () => {
        Engine = {
            Vec3: (x, y, z) => ({ x, y, z }),
            vecMath: {
                add: (a, b) => Engine.Vec3(a.x + b.x, a.y + b.y, a.z + b.z),
                subtract: (a, b) => Engine.Vec3(a.x - b.x, a.y - b.y, a.z - b.z),
                scalarMultiply: (a, b) => Engine.Vec3(a.x * b, a.y * b, a.z * b),
                magnitude: (a) => Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z),
                normalize: (a) => Engine.vecMath.scalarMultiply(a, 1 / Engine.vecMath.magnitude(a)),
                dotProduct: (a, b) => a.x * b.x + a.y * b.y + a.z * b.z,
                crossProduct: (a, b) => Engine.Vec3(a.y * b.z - b.y * a.z, a.z * b.x - b.z * a.x, a.x * b.y - b.x * a.y),
                rotateX: (a, b) => ((s, c) => Engine.Vec3(a.x, a.y * c - a.z * s, a.y * s + a.z * c))(Math.sin(b), Math.cos(b)),
                rotateY: (a, b) => ((s, c) => Engine.Vec3(a.x * c + a.z * s, a.y, a.z * c - a.x * s))(Math.sin(b), Math.cos(b)),
                rotateZ: (a, b) => ((s, c) => Engine.Vec3(a.x * c - a.y * s, a.x * s + a.y * c, a.z))(Math.sin(b), Math.cos(b)),
                rotate: (a, b) => Engine.vecMath.rotateZ(Engine.vecMath.rotateY(Engine.vecMath.rotateX(a, b.x), b.y), b.z)
            },
            Ray: (pos, dir) => ({ pos, dir }),
            Color: (r, g, b) => ({ r, g, b }),
            colorMath: {
                add: (a, b) => Engine.Color(a.r + b.r, a.g + b.g, a.b + b.b),
                multiply: (a, b) => Engine.Color(a.r * b.r, a.g * b.g, a.b * b.b),
                scalarMultiply: (a, b) => Engine.Color(a.r * b, a.g * b, a.b * b),
                toComputational: (a) => Engine.colorMath.scalarMultiply(a, 1/255),
                toGraphical: (a) => Engine.colorMath.scalarMultiply(a, 255),
            },
            Triangle: (points, color, diffuseColor, specularColor, glossinessConstant) => ({ points, color: Engine.colorMath.toComputational(color), normal: Engine.vecMath.crossProduct(Engine.vecMath.normalize(Engine.vecMath.subtract(points[1], points[0])), Engine.vecMath.normalize(Engine.vecMath.subtract(points[1], points[2]))), diffuseColor, specularColor, glossinessConstant }),
            Light: (pos, color, strength) => ({ pos, color: Engine.colorMath.toComputational(color), strength }),
            Camera: (pos, rot, fov, maxDistance, ambient) => ({ pos, rot, fov, maxDistance, ambient: Engine.colorMath.toComputational(ambient) }),
            rayCasting: {
                distance: (ray, triangle) => Engine.vecMath.dotProduct(triangle.normal, Engine.vecMath.subtract(triangle.points[0], ray.pos)) / Engine.vecMath.dotProduct(triangle.normal, ray.dir),
                isInside: (point, triangle, distance) => {
                    return ((a, b, c) => {
                        return ((u, v, w) => {
                            return (Engine.vecMath.dotProduct(u, v) > 0 && Engine.vecMath.dotProduct(u, w) > 0) ? { hit: true, distance, point } : { hit: false }
                        })(Engine.vecMath.crossProduct(b, c), Engine.vecMath.crossProduct(c, a), Engine.vecMath.crossProduct(a, b))
                    })(Engine.vecMath.subtract(triangle.points[0], point), Engine.vecMath.subtract(triangle.points[1], point), Engine.vecMath.subtract(triangle.points[2], point))
                },
                cast: (ray, triangle, maxDistance) => {
                    return ((distance) => {
                        return (distance > 0 && distance < maxDistance) ? Engine.rayCasting.isInside(Engine.vecMath.add(ray.pos, Engine.vecMath.scalarMultiply(ray.dir, distance)), triangle, distance) : { hit: false }
                    })(Engine.rayCasting.distance(ray, triangle))
                }
            },
            shading: {
                castShadows: (lightRays, camPos, point, normal, triangles, lights) => {
                    lights.forEach(light => {
                        ((lightRay, distance, lightRayBlocked = false, i = 0) => {
                            [
                                () => {
                                    while(!lightRayBlocked && i < triangles.length){
                                        [
                                            () => { lightRayBlocked = Engine.rayCasting.cast(lightRay, triangles[i], distance - 0.001).hit },
                                            () => { i++ }
                                        ].forEach(f => f())
                                    }
                                },
                                () => {
                                    if(!lightRayBlocked){
                                        ((pointToLight) => {
                                            lightRays.push({
                                                diffuseAngleCosine: Engine.vecMath.dotProduct(normal, pointToLight),
                                                specularAngleCosine: Engine.vecMath.dotProduct(normal, Engine.vecMath.normalize(Engine.vecMath.add(pointToLight, Engine.vecMath.normalize(Engine.vecMath.subtract(camPos, point))))),
                                                distance, color: light.color, strength: light.strength
                                            })
                                        })(Engine.vecMath.normalize(Engine.vecMath.subtract(point, light.pos)))
                                    }
                                }
                            ].forEach(f => f())
                        })(Engine.Ray(light.pos, Engine.vecMath.normalize(Engine.vecMath.subtract(point, light.pos))), Engine.vecMath.magnitude(Engine.vecMath.subtract(light.pos, point)))
                    })
                },
                shade: (triangle, ambient, lightRays, callback) => {
                    ((computed = null) => {
                        [
                            () => { computed = Engine.colorMath.multiply(triangle.color, ambient) },
                            () => {
                                lightRays.forEach(lightRay => {
                                    computed = Engine.colorMath.add(computed, Engine.colorMath.scalarMultiply(Engine.colorMath.add(
                                        Engine.colorMath.multiply(triangle.diffuseColor, Engine.colorMath.scalarMultiply(lightRay.color, lightRay.diffuseAngleCosine ** 2)),
                                        Engine.colorMath.multiply(triangle.specularColor, Engine.colorMath.scalarMultiply(lightRay.color, lightRay.specularAngleCosine ** triangle.glossinessConstant))
                                    ), lightRay.strength / (lightRay.distance ** 2))) 
                                })
                            },
                            () => { callback(computed) }
                        ].forEach(f => f())
                    })()
                }
            },
            rayTracing: {
                temp: {},
                topLeft: (camera, width, height) => Engine.vecMath.rotate(Engine.vecMath.normalize(Engine.Vec3(Math.tan(-camera.fov / 2), Math.tan(-camera.fov / 2) * height/width, 1)), camera.rot),
                bottomLeft: (camera, width, height) => Engine.vecMath.rotate(Engine.vecMath.normalize(Engine.Vec3(Math.tan(-camera.fov / 2), Math.tan(camera.fov / 2) * height/width, 1)), camera.rot),
                topRight: (camera, width, height) => Engine.vecMath.rotate(Engine.vecMath.normalize(Engine.Vec3(Math.tan(camera.fov / 2), Math.tan(-camera.fov / 2) * height/width, 1)), camera.rot),
                deltaX: (topLeftRay, topRightRay, width) => Engine.vecMath.scalarMultiply(Engine.vecMath.subtract(topRightRay, topLeftRay), 1 / width),
                deltaY: (topLeftRay, bottomLeftRay, height) => Engine.vecMath.scalarMultiply(Engine.vecMath.subtract(bottomLeftRay, topLeftRay), 1 / height),
                createRay: (pos, x, y, deltaX, height, deltaY, topLeft) => Engine.Ray(pos, Engine.vecMath.normalize(
                    Engine.vecMath.add(
                        topLeft,
                        Engine.vecMath.add(
                            Engine.vecMath.scalarMultiply(x, deltaX),
                            Engine.vecMath.scalarMultiply(y, height - deltaY)
                        )
                    )
                )),
                generateImage: (image, camera, triangles, lights, options) => {
                    ((topLeft, bottomLeft, topRight) => {
                        ((deltaX, deltaY) => {
                            for(let i = 0;i<options.width;i++){
                                [
                                    () => { image.push([]) },
                                    () => {
                                        for(let j = 0;j<options.height;j++){
                                            ((ray, bestCast = { distance: Infinity, point: null, triangle: null }) => {
                                                [
                                                    () => {
                                                        triangles.forEach(triangle => {
                                                            ((cast) => {
                                                                if(cast.hit && cast.distance < bestCast.distance){
                                                                    bestCast = { distance: cast.distance, point: cast.point, triangle }
                                                                }
                                                            })(Engine.rayCasting.cast(ray, triangle, camera.maxDistance))
                                                        })
                                                    },
                                                    (lightRays = []) => {
                                                        if(bestCast.triangle != null){
                                                            [
                                                                () => { Engine.shading.castShadows(lightRays, camera.pos, bestCast.point, bestCast.triangle.normal, triangles, lights) },
                                                                () => { Engine.shading.shade(bestCast.triangle, camera.ambient, lightRays, (computed) => {
                                                                    image[i].push(Engine.colorMath.toGraphical(computed))
                                                                }) },
                                                            ].forEach(f => f())
                                                        } else {
                                                            image[i].push(Engine.colorMath.toGraphical(Engine.Color(0, 0, 0)))
                                                        }
                                                    }
                                                ].forEach(f => f())
                                            })(Engine.Ray(camera.pos, Engine.vecMath.normalize(Engine.vecMath.add(
                                                topLeft,
                                                Engine.vecMath.add(
                                                    Engine.vecMath.scalarMultiply(deltaX, i),
                                                    Engine.vecMath.scalarMultiply(deltaY, options.height - j)
                                                )
                                            ))))
                                        }
                                    }
                                ].forEach(f => f())
                            }
                        })(Engine.rayTracing.deltaX(topLeft, topRight, options.width), Engine.rayTracing.deltaY(topLeft, bottomLeft, options.height))
                    })(Engine.rayTracing.topLeft(camera, options.width, options.height), Engine.rayTracing.bottomLeft(camera, options.width, options.height), Engine.rayTracing.topRight(camera, options.width, options.height))
                }
            },
            render: (canvas, image, bg) => {
                ((ctx) => {
                    [
                        () => { ctx.fillStyle = `rgb(${bg.r}, ${bg.g}, ${bg.b})` },
                        () => { ctx.fillRect(0, 0, canvas.width, canvas.height) },
                        () => {
                            for(let i = 0;i<image.length;i++){
                                for(let j = 0;j<image[0].length;j++){
                                    [
                                        () => { ctx.fillStyle = `rgb(${image[i][j].r}, ${image[i][j].g}, ${image[i][j].b})` },
                                        () => { ctx.fillRect(i, j, 1, 1) }
                                    ].forEach(f => f())
                                }
                            }
                        }
                    ].forEach(f => f())
                })(canvas.getContext("2d", { alpha: false }))
            }
        }
    },
    () => {
        ((canvas, camera, triangles, lights, bg, image = []) => {
            [
                () => { Engine.rayTracing.generateImage(image, camera, triangles, lights, { width: canvas.width, height: canvas.height }) },
                () => { Engine.render(canvas, image, bg) }
            ].forEach(f => f())
        })(
            document.getElementById("canvas"),
            Engine.Camera(
                Engine.Vec3(-15, 10, -5),
                Engine.Vec3(0.3, 0.4, 0),
                120 * Math.PI / 180,
                1000,
                Engine.Color(110, 110, 110)
            ),
            [
                Engine.Triangle(
                    [
                        Engine.Vec3(5, 5, 5),
                        Engine.Vec3(-5, 5, 5),
                        Engine.Vec3(-5, -5, 5)
                    ],
                    Engine.Color(255, 0, 0),
                    Engine.Color(10, 10, 10),
                    Engine.Color(10, 10, 10),
                    8
                ),
                Engine.Triangle(
                    [
                        Engine.Vec3(5, 5, 5),
                        Engine.Vec3(5, -5, 5),
                        Engine.Vec3(-5, -5, 5)
                    ],
                    Engine.Color(255, 0, 0),
                    Engine.Color(10, 10, 10),
                    Engine.Color(10, 10, 10),
                    8
                ),
                Engine.Triangle(
                    [
                        Engine.Vec3(5, 5, 15),
                        Engine.Vec3(-5, 5, 15),
                        Engine.Vec3(-5, -5, 15)
                    ],
                    Engine.Color(0, 255, 0),
                    Engine.Color(10, 10, 10),
                    Engine.Color(10, 10, 10),
                    8
                ),
                Engine.Triangle(
                    [
                        Engine.Vec3(5, 5, 15),
                        Engine.Vec3(5, -5, 15),
                        Engine.Vec3(-5, -5, 15)
                    ],
                    Engine.Color(0, 255, 0),
                    Engine.Color(10, 10, 10),
                    Engine.Color(10, 10, 10),
                    8
                ),
                Engine.Triangle(
                    [
                        Engine.Vec3(5, 5, 5),
                        Engine.Vec3(5, 5, 15),
                        Engine.Vec3(5, -5, 15)
                    ],
                    Engine.Color(0, 0, 255),
                    Engine.Color(30, 30, 30),
                    Engine.Color(30, 30, 30),
                    8
                ),
                Engine.Triangle(
                    [
                        Engine.Vec3(5, -5, 5),
                        Engine.Vec3(5, 5, 5),
                        Engine.Vec3(5, -5, 15)
                    ],
                    Engine.Color(0, 0, 255),
                    Engine.Color(30, 30, 30),
                    Engine.Color(30, 30, 30),
                    8
                ),
                Engine.Triangle(
                    [
                        Engine.Vec3(-5, 5, 5),
                        Engine.Vec3(-5, -5, 15),
                        Engine.Vec3(-5, 5, 15)
                    ],
                    Engine.Color(255, 127, 0),
                    Engine.Color(30, 30, 30),
                    Engine.Color(30, 30, 30),
                    8
                ),
                Engine.Triangle(
                    [
                        Engine.Vec3(-5, -5, 5),
                        Engine.Vec3(-5, 5, 5),
                        Engine.Vec3(-5, -5, 15)
                    ],
                    Engine.Color(255, 127, 0),
                    Engine.Color(30, 30, 30),
                    Engine.Color(30, 30, 30),
                    8
                ),
                Engine.Triangle(
                    [
                        Engine.Vec3(5, 5, 5),
                        Engine.Vec3(-5, 5, 15),
                        Engine.Vec3(-5, 5, 5),
                    ],
                    Engine.Color(255, 255, 0),
                    Engine.Color(30, 30, 30),
                    Engine.Color(30, 30, 30),
                    8
                ),
                Engine.Triangle(
                    [
                        Engine.Vec3(5, 5, 5),
                        Engine.Vec3(-5, 5, 15),
                        Engine.Vec3(5, 5, 15),
                    ],
                    Engine.Color(255, 255, 0),
                    Engine.Color(30, 30, 30),
                    Engine.Color(30, 30, 30),
                    8
                ),
                Engine.Triangle(
                    [
                        Engine.Vec3(5, -5, 5),
                        Engine.Vec3(-5, -5, 15),
                        Engine.Vec3(-5, -5, 5),
                    ],
                    Engine.Color(127, 0, 255),
                    Engine.Color(30, 30, 30),
                    Engine.Color(30, 30, 30),
                    8
                ),
                Engine.Triangle(
                    [
                        Engine.Vec3(5, -5, 5),
                        Engine.Vec3(-5, -5, 15),
                        Engine.Vec3(5, -5, 15),
                    ],
                    Engine.Color(127, 0, 255),
                    Engine.Color(30, 30, 30),
                    Engine.Color(30, 30, 30),
                    8
                )
            ],
            [
                Engine.Light(
                    Engine.Vec3(3, 2, 1),
                    Engine.Color(170, 170, 170),
                    3
                )
            ],
            Engine.Color(255, 255, 255)
        )
    }
].forEach(f => f());