// https://dpk3n3gg92jwt.cloudfront.net/domains/humphrey/pdf/320%20&%20420.pdf
#include <SPI.h>
#include "SdFat.h"
#include "sdios.h"
#include <SoftwareSerial.h>
// https://create.arduino.cc/projecthub/electropeak/sd-card-module-with-arduino-how-to-read-write-data-37f390
SdExFat SD;
ExFile myFile;

//UART TO HM10 Module
const int bluRX_ardTXpin = 6;
const int bluTX_ardRXpin = 5;
//relay
int relay = 3;
boolean relayOpen = false;
// pressure sensor (5psi)
int sensorIn = A0;
int sensorOut = A1;
// pressure sensor tank
int sensorTank = A2;
// ble
int beginTime = 0;
boolean Cough = false;
boolean record = false;
// ble values in
String reading = "";
int coughs;
int period;
int rest;
// cycle counter
int counter = 0;

SoftwareSerial bluetooth(bluTX_ardRXpin, bluRX_ardTXpin);

void setup() {
  pinMode(sensorIn,INPUT);
  pinMode(sensorOut,INPUT);
  pinMode(sensorTank,INPUT);
  pinMode(relay, OUTPUT);
  bluetooth.begin(9600);
  Serial.begin(9600);
}

void loop() {
  // pressure in
  int valIn = analogRead(sensorIn);
  double output = float(valIn)/1023.0;
  double pressureIn = (output*30/4)-0.5;
  // pressure out
  int valOut = analogRead(sensorOut);
  output = float(valOut)/1023.0;
  double pressureOut = (output*30/4)-0.5;
  // pressure @ tank
  int analogReading = analogRead(sensorTank);
  int lowerbound = 0.1*1023; // 0 psi
  int middlebound = 1023/2; // 15 psi
  int upperbound = 0.9*1023; // 30 psi
  // linear interpolation
  double pressureTank;
  if(analogReading <= middlebound){
    if(analogReading < lowerbound){
      pressureTank = 0;
    }else{
     double y1 = 0.0;
     double y2 = 15.0;
     double x1 = double(lowerbound);
     double x2 = double(middlebound);
     double x = double(analogReading);
     pressureTank = y1+(((x-x1)/(x2-x1))*(y2-y1)); 
    }
  }else{
    if(analogReading > upperbound){
      pressureTank = 30;
    }else{
      double y1 = 15.0;
      double y2 = 30.0;
      double x1 = double(middlebound);
      double x2 = double(upperbound);
      double x = double(analogReading);
      pressureTank = y1+(((x-x1)/(x2-x1))*(y2-y1));
    }
  }

  if(bluetooth.available()>0){ // receiving data
    //led indicator for bluetooth connected
    char c = bluetooth.read();
    if(c == 'q'){ // turn solenoid on
      digitalWrite(relay, HIGH);
      relayOpen = true;
    }else if(c == 'w'){ // turn solenoid off
      digitalWrite(relay, LOW);
      relayOpen = false;
    }else if(c == 'c'){ // generate cough and record data
      // check if SD card is inserted
      if (!SD.begin(10)) {
        bluetooth.write('y'); // request user to insert sd card first
        Serial.println("sd not in");
      }else{
        Cough = true;
        record = true;
        Serial.println("sd in");
        if(SD.exists("Migration Test.txt")){
          // delete file to create a new one
          SD.remove("Migration Test.txt");
        }
        // open file
        myFile = SD.open("Migration Test.txt", FILE_WRITE);
        myFile.println("Period, Pressure In, Pressure Out");
      }
    }else if(c == 'h'){ // generate cough but don't record data
      Cough = true;
      record = false;
      Serial.println("cough");
    }else if(c == 'a'){ // read number of coughs
      coughs = reading.toInt();
      reading = "";
    }else if(c == 's'){ // read cough duration
      period = reading.toInt();
      reading = "";
    }else if(c == 'd'){ // read rest time
      rest = reading.toInt();
      reading = "";
    }else if(c == 'e'){ // end migration test
      if(record){
        // close file
        myFile.close();
      }
      // reset
      Cough = false;
      record = false;
      counter = 0;
    }else if(c == 'p'){ // pause
      Cough = !Cough;
      if(digitalRead(relay) == 1){
        relayOff();
      }
    }else{
      reading.concat(c);
    }
  }

  if(Cough == true){
    if(record){
      myFile.println("Cough #"+String(counter));
    }
    if(counter < coughs){
      cough();
      delay(rest);
    }else{
      // test ends, reset states
      Cough = false;
      record = false;
      counter = 0;
    }
    if(counter == coughs && record == true){
      // close file
        myFile.close();
    }
  }
  
  // sending data
  if(relayOpen == true){
      // tank pressure
      String s = String(pressureTank);
      char array1[s.length()+1];
      s.toCharArray(array1, s.length()+1);
      for(int i = 0; i<s.length()-1; i++){
        bluetooth.write(array1[i]);
        delay(15);
      }
      bluetooth.write('t');
      delay(15);
      // pressure in
      s = String(pressureIn);
      char array2[s.length()+1];
      s.toCharArray(array2, s.length()+1);
      for(int i = 0; i<s.length(); i++){
        bluetooth.write(array2[i]);
        delay(15);
      }
      bluetooth.write('i');
      delay(15);
      // pressure out
      s = String(pressureOut);
      char array3[s.length()+1];
      s.toCharArray(array3, s.length()+1);
      for(int i = 0; i<s.length(); i++){
        bluetooth.write(array3[i]);
        delay(15);
      }
      bluetooth.write('o');
      delay(15);
    }
}

void relayOn() {
  digitalWrite(relay, HIGH);
  delay(18); // ignore solenoid ON response time
}

void relayOff() {
  digitalWrite(relay, LOW);
  counter++;
  // cycle count
  String s = String(counter);
  char arr[s.length()+1];
  s.toCharArray(arr, s.length()+1);
  for(int i = 0; i<s.length(); i++){
    bluetooth.write(arr[i]);
    delay(15);
  }
  bluetooth.write('z');
  delay(15);
}

void cough() {
  // Generating a cough
  // time: 0.4 s => 400 milliseconds
  // pressure: ~3 psi, exactly 2.84 psi
  relayOn();
  unsigned long startTime = millis();
  while(true){
    // read pressure in and store
    int valIn = analogRead(sensorIn);
    double output = float(valIn)/1023.0;
    double pressureIn = (output*30/4)-0.5;
    // read pressure out and store
    int valOut = analogRead(sensorOut);
    output = float(valOut)/1023.0;
    double pressureOut = (output*30/4)-0.5;
    // read time and store
    int duration = millis() - startTime;
    if(myFile && record){ // write to text file on SD card
      myFile.println(String(duration)+", "+String(pressureIn)+", "+String(pressureOut));
    }
    if(duration >= period){
      relayOff();
      break;
    }
  }
}
