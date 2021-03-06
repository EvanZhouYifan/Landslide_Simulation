// Assigns simpler names to the Matter.Engine, Render, World, and Bodies
var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies;

// Create an engine
var engine = Engine.create();

// Creates the renderer
var render = Render.create({
    element: document.body,
    options: {
        width: window.innerWidth-10,
        height: 550,
        wireframes: false,
        background: "white"
    },
    engine: engine,
    canvas: document.getElementById("defaultCanvas0")
});

// The info
let information;

// Creates the sliders
let groundAngle;
let rockSize;
let vegetation;

// The objects
let ground;
var rocks = [];

// Creates the rocks
class Rock {
    // Sets up class
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.polygon = Bodies.polygon(this.x, this.y, random(5,10), this.r);
        this.polygon.friction = rain?0:1;
        this.polygon.frictionStatic = rain?0:10;
        this.polygon.render.fillStyle = "grey";
    }

    // Adds the rock to the world
    create() {
        World.add(engine.world, this.polygon);
    }
}


// Setup
function setup() {
    // Stops p5 from creating original canvas
    noCanvas();

    // Creates the informations tab
    information = createElement('h2', 'INFORMATION SHOULD BE DISPLAYED HERE IF YOU CAN SEE THIS THEN SOMETHING WENT WRONG');

    // Creates the ground
    ground = Bodies.rectangle(300, 500, sqrt(sq(2*render.options.width) + sq(2*render.options.height)), 375, { isStatic: true });

    // Change color
    ground.render.fillStyle = "#8a4e00";

    // Make sliders
    groundAngle = createSlider(0, 40, 0);
    rockSize = createSlider(5, 40, 20);
    vegetation = createSlider(0, 0.5, 0.5, 0.1);

    // Add the ground to the world
    World.add(engine.world, ground);

    // Run the engine
    Engine.run(engine);

    // Run the renderer
    Render.run(render);
}


// Draw function (Main loop by p5)
function draw() {
    // Sets the information:
    information.html('&nbsp;NUMBER OF ROCKS: '+rocks.length);
    information.html('<br>&nbsp;GROUND SLOPE: '+groundAngle.value()+'&#176;;&#160; ROCK SIZE: '+rockSize.value()+'px;&#160; VEGETATION AMOUNT: '+(2*vegetation.value())*100+'%', true);

    ground.render.fillStyle = colorGradient(2 * vegetation.value(), {red: 122, green: 78, blue:0}, {red: 37, green: 122, blue:0});

    // Sets angle of land (hill) to the groundAngle slider
    Matter.Body.setAngle(ground, groundAngle.value() * Math.PI/180);

    // How much vegetation is on the land, controlling the friction of the rocks
    ground.friction = vegetation.value();

    // Removes the rocks that won't be rendered/seen, for quality
    for (let i in rocks) {
        if (rocks[i].polygon.position.y > render.options.height+20) {
            World.remove(engine.world, rocks[i].polygon);
            rocks.splice(i, 1);
        }
    }
}


// Function for getting a color gradient: Kudos to @gskema on Github!
function colorGradient(fadeFraction, rgbColor1, rgbColor2, rgbColor3) {
    var color1 = rgbColor1;
    var color2 = rgbColor2;
    var fade = fadeFraction;

    // Do we have 3 colors for the gradient? Need to adjust the params.
    if (rgbColor3) {
    fade = fade * 2;

    // Find which interval to use and adjust the fade percentage
    if (fade >= 1) {
        fade -= 1;
        color1 = rgbColor2;
        color2 = rgbColor3;
    }
    }

    var diffRed = color2.red - color1.red;
    var diffGreen = color2.green - color1.green;
    var diffBlue = color2.blue - color1.blue;

    var gradient = {
        red: parseInt(Math.floor(color1.red + (diffRed * fade)), 10),
        green: parseInt(Math.floor(color1.green + (diffGreen * fade)), 10),
        blue: parseInt(Math.floor(color1.blue + (diffBlue * fade)), 10),
    };

    return 'rgb(' + gradient.red + ',' + gradient.green + ',' + gradient.blue + ')';
    }

    // Make rocks when mouse is dragged
    function mouseDragged() {
    if (mouseY < render.options.height) {
        // The rock's position are based on approximately your mouse position
        // The rock's size is based on te rockSize slider
        rocks.push(new Rock(mouseX, mouseY, rockSize.value()));

        // Creates the rocks, so we can see it, and it can be affected by physics
        rocks[rocks.length-1].create();
    }
}

let rain = false;
// Creates new variable to see if there is currently an "earthquake"
let earthquake = false;
function keyPressed() {
    // There has to be rocks or raining when there are no rocks to execute this command!
    if (rocks.length > 0 || rain) {
        // Press the s key to toggle rain; press again to stop
        if (key == "s") {
            rain = rain?false:true;
            // Will make sure each rock is setup based on whether it is raining
            render.options.background = rain?"#474747":"white";
            for (let i = 0; i < rocks.length; i++) {
                rocks[i].polygon.friction = rain?0:1;
                rocks[i].polygon.frictionStatic = rain?0:10;
            }
        }
    }

    // There has to be rocks to be able to execute this command!
    if (rocks.length > 0) {
        // Creates a earthquake/volcano/tsunami/tornado/... you get the point... shakey things
        if (key == "d" && earthquake == false) {
            // Creates a random magnitude of shake (not related to Richter scale)
            let magnitude = random(5,10);
                // Shakes the ground
                for (let i = 0; i < 10; i++) {
                    setTimeout(() => {
                        for (let j = 0; j < 10; j++) {
                            setTimeout(() => {
                                Matter.Body.setPosition(ground, {x: ground.position.x, y: ground.position.y-magnitude});
                            }, j*10);
                        }
                        setTimeout(() => {
                            for (let j = 0; j < 10; j++) {
                                setTimeout(() => {
                                    Matter.Body.setPosition(ground, {x: ground.position.x, y: ground.position.y+magnitude});
                                }, j*10);
                            }
                        }, 100);
                    }, i*200);
                }
            // Make sure the earthquake flag is on so repeats cannot happen
            earthquake = true;
        
            // Correct flag at end of earthquake
            setTimeout(() => {
                earthquake = false;
            }, 2000);
        }
    }
}