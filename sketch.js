const serviceUuid = "0000ffe0-0000-1000-8000-00805f9b34fb";
let blueToothCharacteristic;
let receivedValue = "";

let blueTooth;
let isConnected = false;

let sliderf, valf, prevf = 0, sentf = false; // Frequency
let slidera, vala, preva = 0, senta = false; // Amplitude
let sliderp, valp, prevp = 0, sentp = false; // Period

function setup() {
    createCanvas(400, 270);
    // Frequency
    sliderf = createSlider(0, 255, 0, 1);
    sliderf.position(150, 115);
    sliderf.style('width', '200px');
    // Amplitude
    slidera = createSlider(0, 255, 0, 1);
    slidera.position(150, 165);
    slidera.style('width', '200px');
    // Period
    sliderp = createSlider(0, 255, 0, 1);
    sliderp.position(150, 215);
    sliderp.style('width', '200px');
    // Create a p5ble class
    console.log("setting up");
    blueTooth = new p5ble();

    const connectButton = createButton("Connect");
    connectButton.mousePressed(connectToBle);
    connectButton.position(20, 40);
}

async function draw() {
  background(220)
  fill('black')
  textSize(20)
  text('Frequency', 20, 120)
  text('Amplitude', 20, 170)
  text('Period', 20, 220)
  drawScreen();
  valf = sliderf.value() // freq
  vala = slidera.value() // amp
  valp = sliderp.value() // per
  if(valf !== prevf && !sentf){
    sentf = true
    await sendData(valf.toString())
    await sendData('f')
  }else if(vala !== preva && !senta){
    senta = true
    await sendData(vala.toString())
    await sendData('a')
  }else if(valp !== prevp && !sentp){
    sentp = true
    await sendData(valp.toString())
    await sendData('p')
  }else{
    sentf = false
    senta = false
    sentp = false
    
  }
  
  prevf=valf
  preva=vala
  prevp=valp

}

function connectToBle() {
    // Connect to a device by passing the service UUID
    blueTooth.connect(serviceUuid, gotCharacteristics);
}

// A function that will be called once got characteristics
function gotCharacteristics(error, characteristics) {
  if (error) {
      console.log("error: ", error);
  }
  blueToothCharacteristic = characteristics[0];

  blueTooth.startNotifications(blueToothCharacteristic, handleNotifications);
  
  isConnected = blueTooth.isConnected();
  // Add a event handler when the device is disconnected
  blueTooth.onDisconnected(onDisconnected);
}

// A function that will be called once got characteristics
function handleNotifications(data) {
  console.log('data: ', data);
}

function onDisconnected() {
  console.log("Device got disconnected.");
  isConnected = false;
}

function sendData(command) {
  const inputValue = command;
  if (!("TextEncoder" in window)) {
    console.log("Sorry, this browser does not support TextEncoder...");
  }
  var enc = new TextEncoder(); // always utf-8
  
  return new Promise(resolve => {
    blueToothCharacteristic.writeValue(enc.encode(inputValue));
    setTimeout(() => {
      resolve('resolved');
    }, 100);
  })
}

function receiveData() {
  if(isConnected)
    return new Promise(resolve => {
      const val = blueTooth.read(blueToothCharacteristic);
      setTimeout(() => {
        resolve(val);
      }, 100);
    })
}

function drawScreen() {
  if (isConnected) {
    fill(0, 255, 0);
    ellipse(120, 40, 30, 30);
  } else {
    fill(255, 0, 0);
    ellipse(120, 40, 30, 30);
  }
}