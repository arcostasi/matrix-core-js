// Set Initial Variables
const zmq = require('zeromq'); // Asynchronous Messaging Framework
const matrixIO = require('matrix-protos').matrix_io; // Protocol Buffers for MATRIX function
const matrixIP = '192.168.15.12';  // Local IP
const everloopBasePort = 20021 // Port for Everloop driver
let matrixDeviceLeds = 0;    // Holds amount of LEDs on MATRIX device

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
const configSocket = zmq.socket('push');// Create a Pusher socket

// Connect Pusher to Base port
configSocket.connect('tcp://' + matrixIP + ':' + everloopBasePort);

// Create an empty Everloop image
let image = matrixIO.malos.v1.io.EverloopImage.create();
let counter = 0;

// Loop every 25 milliseconds
setInterval(function() {
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

    // Set LED red
    image.led[(counter / 2) % matrixDeviceLeds] = {
        red: 20,
        green: 0,
        blue: 0,
        white: 0
    };

    // Set LED green
    image.led[(counter / 7) % matrixDeviceLeds] = {
        red: 0,
        green: 30,
        blue: 0,
        white: 0
    };

    // Set LED blue
    image.led[(counter / 11) % matrixDeviceLeds] = {
        red: 0,
        green: 0,
        blue: 30,
        white: 0
    };

    // Set LED white
    image.led[matrixDeviceLeds - 1 - (counter % matrixDeviceLeds)] = {
        red: 0,
        green: 0,
        blue: 0,
        white: 10
    };

    ++counter; // Increment animation

    // Store the Everloop image in MATRIX configuration
    let config = matrixIO.malos.v1.driver.DriverConfig.create({
        'image': image
    });

    // Send MATRIX configuration to MATRIX device
    if (matrixDeviceLeds > 0)
        configSocket.send(matrixIO.malos.v1.driver.DriverConfig.encode(config).finish());
}, 25);
