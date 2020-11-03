// Set Initial Variables
const zmq = require('zeromq'); // Asynchronous Messaging Framework
const matrixIO = require('matrix-protos').matrix_io; // Protocol Buffers for MATRIX function
const figures = require('figures'); // Icons
const matrixIP = '192.168.15.12';  // Local IP
const servoBasePort = 20045;   // Port for Servo driver
const everloopBasePort = 20021 // Port for Everloop driver
let matrixDeviceLeds = 0;      // Holds amount of LEDs on MATRIX device

// Create a Pusher socket
const configServoSocket = zmq.socket('push');

// Connect Pusher to Base port
configServoSocket.connect('tcp://' + matrixIP + ':' + servoBasePort);

// Create a Subscriber socket
const errorServoSocket = zmq.socket('sub');
// Connect Subscriber to Error port
errorServoSocket.connect('tcp://' + matrixIP + ':' + (servoBasePort + 2));
// Connect Subscriber to Error port
errorServoSocket.subscribe('');
// On Message
errorServoSocket.on('message', function(error_message){
  console.log('Error received: ' + error_message.toString('utf8'));// Log error
});

// Port error
const errorSocket = zmq.socket('sub'); // Create a Subscriber socket
errorSocket.connect('tcp://' + matrixIP + ':' + (everloopBasePort + 2)); // Connect Subscriber to Error port
errorSocket.subscribe(''); // Subscribe to messages
// On Message
errorSocket.on('message', (error_message) => {
    console.log('Error received: ' + error_message.toString('utf8')); // Log error
});

// Data update port
const updateSocket = zmq.socket('sub'); // Create a Subscriber socket
updateSocket.connect('tcp://' + matrixIP + ':' + (everloopBasePort + 3));// Connect Subscriber to Data Update port
updateSocket.subscribe(''); // Subscribe to messages
// On Message
updateSocket.on('message', (buffer) => {
    let data = matrixIO.malos.v1.io.EverloopImage.decode(buffer); // Extract message
    matrixDeviceLeds = data.everloopLength; // Save MATRIX device LED count
});

// Keep-alive port
const pingSocket = zmq.socket('push'); // Create a Pusher socket

// Connect Pusher to Keep-alive port
pingSocket.connect('tcp://' + matrixIP + ':' + (everloopBasePort + 1));
pingSocket.send(''); // Send a single ping

// Base port
const configSocket = zmq.socket('push'); // Create a Pusher socket

// Connect Pusher to Base port
configSocket.connect('tcp://' + matrixIP + ':' + everloopBasePort);

// Create an empty Everloop image
let image = matrixIO.malos.v1.io.EverloopImage.create();

// Create driver configuration
let config = matrixIO.malos.v1.driver.DriverConfig.create({
  // Create servo configuration
  servo: matrixIO.malos.v1.io.ServoParams.create({
    pin: 0,// Use pin 0
    angle: 0// Set angle 0
  })
});

function map(num, inMin, inMax, outMin, outMax) {
    return (num - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

// Loop every second
let interval = setInterval(function() {
    // Pick number from 1-180
    let angle = Math.floor(Math.random() * 90) + 1;

    // Set number as new random angle
    config.servo.angle = angle;

    let ledPos = Math.floor(map(angle, 0, 90, 1, matrixDeviceLeds));

    // Log angle
    console.log('Angle: ' + angle);
    console.log('LED: ' + ledPos);

    // For each device LED
    for (let i = 0; i < matrixDeviceLeds; ++i) {
        // Set individual LED value
        image.led[i] = {
            red: 0,
            green: 0,
            blue: 0,
            white: 0
        };
    }

    // Set individual LED value
    image.led[ledPos] = {
        red: Math.floor(Math.random() * 200) + 1,
        green: Math.floor(Math.random() * 255) + 1,
        blue: Math.floor(Math.random() * 50) + 1,
        white: 0
    };

    // Store the Everloop image in MATRIX configuration
    let configImage = matrixIO.malos.v1.driver.DriverConfig.create({
        'image': image
    });

    // Send driver configuration
    configServoSocket.send(matrixIO.malos.v1.driver.DriverConfig.encode(config).finish());

    // Send MATRIX configuration to MATRIX device
    if (matrixDeviceLeds > 0)
        configSocket.send(matrixIO.malos.v1.driver.DriverConfig.encode(configImage).finish());

}, 1000);

// Enables keypress events to be emitted from the console
const readline = require('readline');
readline.emitKeypressEvents(process.stdin);

process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    // Stop animation
    clearInterval(interval);
    console.log('\x1b[31m%s\x1b[0m', figures.tick, 'Shutting down');

    // Create driver configuration
    let reset = matrixIO.malos.v1.driver.DriverConfig.create({
      // Create servo configuration
      servo: matrixIO.malos.v1.io.ServoParams.create({
        pin: 0, // Use pin 0
        angle: 90 // Set angle 0
      })
    });

    // Send driver configuration
    configSocket.send(matrixIO.malos.v1.driver.DriverConfig.encode(reset).finish());

    // For each device LED
    for (let i = 0; i < matrixDeviceLeds; ++i) {
        // Set individual LED value
        image.led[i] = {
            red: 0,
            green: 0,
            blue: 0,
            white: 0
        };
    }

    // Store the Everloop image in MATRIX configuration
    let configImage = matrixIO.malos.v1.driver.DriverConfig.create({
        'image': image
    });

    // Send MATRIX configuration to MATRIX device
    if (matrixDeviceLeds > 0)
        configSocket.send(matrixIO.malos.v1.driver.DriverConfig.encode(configImage).finish());

    // Process exit after 1 second
    setTimeout(function() {
        process.exit();
    }, 1000);
  }
});

// Clear screen
process.stdout.write('\033c');

// Prints on the console
console.log('\x1b[32m%s\x1b[0m', figures.tick, 'Getting started');
console.log('Press <Ctrl+C> to exit...');
