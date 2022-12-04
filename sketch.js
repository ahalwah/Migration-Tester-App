const serviceUuid = "0000ffe0-0000-1000-8000-00805f9b34fb";
let blueToothCharacteristic;
let receivedValue = "";

let blueTooth;
let isConnected = false;

// buttons
let connectButton;
let coughButton;
let solenoidOn;
let solenoidOff;
let beginBtn; // begin coughs

// checkbox
let saveData;
let box;
let label;

// inputs
let inp1, inp2, inp3;

// readings
let reading;
let pressTank = '';
let pressIn = '';
let pressOut = '';
let period = '';

// input variables
let coughsInput;
let durationInput;
let restInput;

async function setup() {
    createCanvas(windowWidth, windowWidth*0.47);
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

    beginBtn = createButton("Begin");
    beginBtn.mousePressed(beginCoughs);
    beginBtn.position(width*0.43, width*0.34);
    beginBtn.size(width*0.06, width*0.04);
    beginBtn.style('font-size', `${width*0.013}px`);
    beginBtn.style('border-radius', `${width*0.005}px`);

    inp1 = createInput('');
    inp1.position(width*0.21, width*0.348);
    inp1.size(width*0.07, width*0.02);
    inp1.style('font-size', `${width*0.013}px`);
    inp1.style('border-radius', `${width*0.005}px`);
    inp1.input(inputEvent);

    inp2 = createInput('');
    inp2.position(width*0.21, width*0.387);
    inp2.size(width*0.07, width*0.02);
    inp2.style('font-size', `${width*0.013}px`);
    inp2.style('border-radius', `${width*0.005}px`);
    inp2.input(inputEvent2);

    inp3 = createInput('');
    inp3.position(width*0.21, width*0.427);
    inp3.size(width*0.07, width*0.02);
    inp3.style('font-size', `${width*0.013}px`);
    inp3.style('border-radius', `${width*0.005}px`);
    inp3.input(inputEvent3);

    saveData = createCheckbox('save data', false);
    saveData.position(width*0.53, width*0.35);
    box = saveData.elt.getElementsByTagName('input')[0];
    label = saveData.elt.getElementsByTagName('label')[0];
    label.style.fontSize = `${width*0.018}px`
    label.style.marginLeft = `${width*0.01}px`
    box.style.transform = `scale(${width*0.0015})`;
    // saveData.changed(myCheckedEvent);
}

function inputEvent() {
  coughsInput = this.value()
  console.log(this.value())
}
function inputEvent2() {
  durationInput = this.value()
  console.log(this.value())
}
function inputEvent3() {
  restInput = this.value()
  console.log(this.value())
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
  line(width*0.365, width*0.13, width*0.365, width*0.30) // vertical line
  line(width*0.04, width*0.17, width*0.33, width*0.17) // manual controls
  line(width*0.40, width*0.17, width*0.68, width*0.17) // system pressure
  line(width*0.04, width*0.32, width*0.68, width*0.32) // automatic controls
  textSize(width*0.02)
  fill('black')
  text('Cough Number', width*0.04, width*0.36)
  text('coughs', width*0.29, width*0.36)
  text('Cough Duration', width*0.04, width*0.40)
  text('ms', width*0.29, width*0.40)
  text('Rest Time', width*0.04, width*0.44)
  text('ms', width*0.29, width*0.44)
  text('Cough Rate', width*0.4, width*0.42)
  text('coughs', width*0.63, width*0.41)
  line(width*0.63, width*0.42, width*0.695, width*0.42)
  text('min', width*0.645, width*0.44)
  if(isNumeric(coughsInput) && isNumeric(durationInput) && isNumeric(restInput)){
    let cough = parseInt(coughsInput)
    let duration = parseInt(durationInput)
    let rest = parseInt(restInput)
    text(round((duration+rest)/1000*cough/60, 2), width*0.56, width*0.42)
  }
  
  text('Solenoid', width*0.04, width*0.22)
  text('Tank Pressure', width*0.4, width*0.21)
  if(pressTank[0] === 'u' && pressTank.length > 1){
    pressTank = pressTank.substring(9)
  }
  text(pressTank, width*0.56, width*0.21)
  text('psi', width*0.65, width*0.21)
  text('Pressure In', width*0.4, width*0.25)
  if(pressIn[0] === 'u' && pressIn.length > 1){
    pressIn = pressIn.substring(9)
  }
  text(pressIn, width*0.56, width*0.25)
  text('psi', width*0.65, width*0.25)
  text('Pressure Out', width*0.4, width*0.29)
  if(pressOut[0] === 'u' && pressOut.length > 1){
    pressOut = pressOut.substring(9)
  }
  text(pressOut, width*0.56, width*0.29)
  text('psi', width*0.65, width*0.29)


  bleIndicator();
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
  }else if(String.fromCharCode(data) === 'y'){// ask user to insert sd card
    if(saveData.checked())
      alert('Can not read SD card!')
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
  if(isConnected) await sendData('q');
}

async function turnSolenoidOff() {
  if(isConnected) await sendData('w');
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

  beginBtn.position(width*0.43, width*0.34);
  beginBtn.size(width*0.06, width*0.04);
  beginBtn.style('font-size', `${width*0.013}px`);
  beginBtn.style('border-radius', `${width*0.005}px`);

  inp1.position(width*0.21, width*0.348);
  inp1.size(width*0.07, width*0.02);
  inp1.style('font-size', `${width*0.013}px`);
  inp1.style('border-radius', `${width*0.005}px`);

  inp2.position(width*0.21, width*0.387);
  inp2.size(width*0.07, width*0.02);
  inp2.style('font-size', `${width*0.013}px`);
  inp2.style('border-radius', `${width*0.005}px`);

  inp3.position(width*0.21, width*0.427);
  inp3.size(width*0.07, width*0.02);
  inp3.style('font-size', `${width*0.013}px`);
  inp3.style('border-radius', `${width*0.005}px`);

  saveData.position(width*0.53, width*0.35);
  label.style.fontSize = `${width*0.018}px`
  label.style.marginLeft = `${width*0.01}px`
  box.style.transform = `scale(${width*0.0015})`;
}

async function beginCoughs() {
  if(isConnected){
    // check all inputs as strings will be whole numbers
    if(!isNaN(coughsInput) && !isNaN(durationInput) && !isNaN(restInput)){
      // send number of coughs
      for(let i = 0; i < coughsInput.length; i++){
        await sendData(coughsInput[i])
      }
      await sendData('a')
      // send duration of cough
      for(let i = 0; i < durationInput.length; i++){
        await sendData(durationInput[i])
      }
      await sendData('s')
      // send rest time betweem coughs
      for(let i = 0; i < restInput.length; i++){
        await sendData(restInput[i])
      }
      await sendData('d')
      if (saveData.checked()){
        await sendData('c')
      }else{
        await sendData('h')
      }
    }else{
      alert('input integer values for cough parameters')
    }
  }
}

function isNumeric(str) {
  if (typeof str != "string") return false // we only process strings!  
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
         !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}
