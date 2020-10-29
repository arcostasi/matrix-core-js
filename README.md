## Matrix Core JS examples

This layer uses Protocol Buffers & ZeroMQ to communicate with your MATRIX device.
Applications for your MATRIX device can be programmed with any language that supports these tools.

### Requeriments

1. Raspberry pi Zero or 3
2. MATRIX Voice or MATRIX Creator

For these examples, I'm using the Matrix Voice connected to the Raspberry Pi Zero W.

### Installation

Before starting, ensure you have access to the terminal of your Raspberry Pi via an SSH-session or a connected screen, mouse, and keyboard. Then insert and run the following commands into your Raspberry Pi's terminal, one at a time.

Add the MATRIX repository and key:

```
curl https://apt.matrix.one/doc/apt-key.gpg | sudo apt-key add -
echo "deb https://apt.matrix.one/raspbian $(lsb_release -sc) main" | sudo tee /etc/apt/sources.list.d/matrixlabs.list
```

Update your repository and packages:

```
sudo apt-get update
sudo apt-get upgrade
```

Install the the MATRIX CORE packages:

```
sudo apt-get install matrixio-malos
```

Reboot your Raspberry Pi:

```
sudo reboot
```

MATRIX CORE will now be running as a service each time your Raspberry Pi boots up.

Using Raspberry Pi OS, as root:

Install Node.js preferably LTS:

```
curl -sL https://deb.nodesource.com/setup_lts.x | bash -
apt-get install -y nodejs
```

These remaining commands will install ZeroMQ:

```
echo "deb http://download.opensuse.org/repositories/network:/messaging:/zeromq:/release-stable/Debian_9.0/ ./" | sudo tee /etc/apt/sources.list.d/zeromq.list
wget https://download.opensuse.org/repositories/network:/messaging:/zeromq:/release-stable/Debian_9.0/Release.key -O- | sudo apt-key add
```

To install ZeroMQ for Node, download and install the package from npm. Here we use the version 5.x branch since version 6.x is still in beta.

npm install zeromq@5

### Why ZeroMQ?

ZeroMQ (also known as ØMQ, 0MQ, or zmq) looks like an embeddable networking library but acts like a concurrency framework. It gives you sockets that carry atomic messages across various transports like in-process, inter-process, TCP, and multicast. You can connect sockets N-to-N with patterns like fan-out, pub-sub, task distribution, and request-reply. It's fast enough to be the fabric for clustered products. Its asynchronous I/O model gives you scalable multicore applications, built as asynchronous message-processing tasks. It has a score of language APIs and runs on most operating systems.

### Getting Started

> Make sure this is running on your Raspberry Pi

Install all dependencies:

```bash
npm install
```

Start the program:

```bash
npm run app
```
