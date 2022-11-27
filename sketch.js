const serviceUuid = "0000ffe0-0000-1000-8000-00805f9b34fb";
let blueToothCharacteristic;
let receivedValue = "";

let blueTooth;
let isConnected = false;

// buttons
let connectButton;
let coughButton;
let coughPressed = false;
let solenoidOn;
let solenoidOff;

// readings
let reading;
let pressTank = '';
let pressIn = '';
let pressOut = '';
let period = '';

// table
let table;
let newRow; 
let saveDataButton;
let enableSaving = false;

async function setup() {
    createCanvas(windowWidth, windowHeight);
    table = new p5.Table();
    table.addColumn('Time')
    table.addColumn('Pressure In')
    table.addColumn('Pressure Out')
    // Create a p5ble class
    console.log("setting up");
    blueTooth = new p5ble();

    connectButton = createButton("Connect");
    connectButton.mousePressed(connectToBle);
    connectButton.position(width*0.865, width*0.15);
    connectButton.size(width*0.08, width*0.04);
    connectButton.style('font-size', `${width*0.013}px`);
    connectButton.style('border-radius', `${width*0.005}px`);

    solenoidOn = createButton("On");
    solenoidOn.mousePressed(turnSolenoidOn);
    solenoidOn.position(width*0.15, width*0.19);
    solenoidOn.size(width*0.06, width*0.04);
    solenoidOn.style('font-size', `${width*0.013}px`);
    solenoidOn.style('border-radius', `${width*0.005}px`);

    solenoidOff = createButton("Off");
    solenoidOff.mousePressed(turnSolenoidOff);
    solenoidOff.position(width*0.23, width*0.19);
    solenoidOff.size(width*0.06, width*0.04);
    solenoidOff.style('font-size', `${width*0.013}px`);
    solenoidOff.style('border-radius', `${width*0.005}px`);

    saveDataButton = createButton("Save Test Data");
    saveDataButton.mousePressed(saveData);
    saveDataButton.position(width*0.47, width*0.33);
    saveDataButton.size(width*0.15, width*0.04);
    saveDataButton.style('font-size', `${width*0.018}px`);
    saveDataButton.style('border-radius', `${width*0.005}px`);
}

async function draw() {
  background(220)
  fill('black')
  textSize(width*0.04)
  text('Migration Tester Controls', width*0.04, width*0.07)
  strokeWeight(5)
  line(width*0.04, width*0.1, width*0.7, width*0.1)
  textSize(width*0.025)
  text('Manual Controls', width*0.04, width*0.15)
  text('Automatic Controls', width*0.04, width*0.3)
  text('System Pressure', width*0.4, width*0.15)
  strokeWeight(3)
  line(width*0.365, width*0.13, width*0.365, width*0.45) // vertical line
  line(width*0.04, width*0.17, width*0.33, width*0.17) // manual controls
  line(width*0.40, width*0.17, width*0.68, width*0.17) // system pressure
  line(width*0.04, width*0.32, width*0.33, width*0.32) // automatic controls
  textSize(width*0.02)
  text('Generate Cough', width*0.04, width*0.37)
  coughPressed ? fill('rgba(0,0,255,0.2)') : fill('blue');
  strokeWeight(1)
  coughButton = circle(width*0.25, width*0.36, width*0.05)
  fill('black')
  text('Cough Duration', width*0.04, width*0.43)
  if(period[0] === 'u' && period.length > 1){
    period = period.substring(9)
  }
  text(period, width*0.24, width*0.43)
  text('ms', width*0.29, width*0.43)
  text('Solenoid', width*0.04, width*0.22)
  text('Tank Pressure', width*0.4, width*0.21)
  if(pressTank[0] === 'u' && pressTank.length > 1){
    pressTank = pressTank.substring(9)
  }
  text(pressTank, width*0.58, width*0.21)
  text('psi', width*0.65, width*0.21)
  text('Pressure In', width*0.4, width*0.25)
  if(pressIn[0] === 'u' && pressIn.length > 1){
    pressIn = pressIn.substring(9)
  }
  text(pressIn, width*0.58, width*0.25)
  text('psi', width*0.65, width*0.25)
  text('Pressure Out', width*0.4, width*0.29)
  if(pressOut[0] === 'u' && pressOut.length > 1){
    pressOut = pressOut.substring(9)
  }
  text(pressOut, width*0.58, width*0.29)
  text('psi', width*0.65, width*0.29)

  bleIndicator();

  enableSaving ? saveDataButton.removeAttribute('disabled') : saveDataButton.attribute('disabled', '');
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
  if(String.fromCharCode(data) === 't'){ // tank pressure indicator
    pressTank = reading;
    reading = ''
  }else if(String.fromCharCode(data) === 'i'){// in pressure indicator
    pressIn = reading;
    reading = ''
  }else if(String.fromCharCode(data) === 'o'){// out pressure indicator
    pressOut = reading;
    reading = ''
  }else if(String.fromCharCode(data) === 'p'){// period indicator
    period = reading;
    reading = ''
  }else if(String.fromCharCode(data) === 'j'){// period data value
    newRow = table.addRow();
    newRow.setNum('Time', parseInt(reading));
    reading = ''
  }else if(String.fromCharCode(data) === 'k'){// pressure in data value
    newRow.setNum('Pressure In', parseFloat(reading));
    reading = ''
  }else if(String.fromCharCode(data) === 'l'){// pressure out data value
    newRow.setNum('Pressure Out', parseFloat(reading));
    reading = ''
  }else if(String.fromCharCode(data) === 'z'){// all test data received
    enableSaving = true;
    console.log('received')
    reading = ''
  }else{
    let incoming = String.fromCharCode(data);
    if(incoming === '.' || !isNaN(incoming))
      reading += String.fromCharCode(data);
  }
  // console.log('data: ', String.fromCharCode(data));
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

async function turnSolenoidOn() {
  if(isConnected) await sendData('1');
}

async function turnSolenoidOff() {
  if(isConnected) await sendData('2');
}

function saveData() {
  saveTable(table, 'migration_data.csv')
}

function bleIndicator() {
  if (isConnected) {
    fill(0, 255, 0);
  } else {
    fill(255, 0, 0);
  }
  strokeWeight(1)
  circle(width*0.9, width*0.08, 0.1*width);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  connectButton.position(width*0.865, width*0.15);
  connectButton.size(width*0.08, width*0.04);
  connectButton.style('font-size', `${width*0.013}px`);
  connectButton.style('border-radius', `${width*0.005}px`);

  solenoidOn.position(width*0.15, width*0.19);
  solenoidOn.size(width*0.06, width*0.04);
  solenoidOn.style('font-size', `${width*0.013}px`);
  solenoidOn.style('border-radius', `${width*0.005}px`);

  solenoidOff.position(width*0.23, width*0.19);
  solenoidOff.size(width*0.06, width*0.04);
  solenoidOff.style('font-size', `${width*0.013}px`);
  solenoidOff.style('border-radius', `${width*0.005}px`);

  saveDataButton.position(width*0.47, width*0.33);
  saveDataButton.size(width*0.15, width*0.04);
  saveDataButton.style('font-size', `${width*0.018}px`);
  saveDataButton.style('border-radius', `${width*0.005}px`);
}

async function mouseClicked() {
  let x = mouseX;
  let y = mouseY;
  let center_x = width*0.25;
  let center_y = width*0.36;
  let radius = width*0.06;
  
  if((x-center_x)**2 + (y-center_y)**2 <= radius**2){
    // disable save data button
    enableSaving = false;
    await sendData('c'); // c character command for cough
    // delete rows to reset data table
    let rowNum = table.getRowCount();
    for (let r = 0; r < rowNum; r++){
      table.removeRow(0);
    }
  }
}

function mousePressed() {
  let x = mouseX;
  let y = mouseY;
  let center_x = width*0.25;
  let center_y = width*0.36;
  let radius = width*0.06;
  if((x-center_x)**2 + (y-center_y)**2 <= radius**2){
    coughPressed = true;
  }
}

function mouseReleased() {
  coughPressed = false;
}
