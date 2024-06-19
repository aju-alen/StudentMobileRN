# APK Download 
Since I have not yet published to any of the stores, there is an APK download available [APK Download](https://drive.google.com/file/d/1gZYXDEj80Ou_YGmjuYlOChPjHJSQMMgf/view?usp=drive_link) 

# How to locally install in your PC.

* (Clone the project) - Open Terminal/ Git Bash on your specific directory and type in the command ``` git clone https://github.com/aju-alen/StudentMobileRN.git ```
* Navigate into both .\client\ and .\api\ directory and install dependencies using ```npm i  ```
*  in the .\api\ directory, create a .env file and copy all contents from the sample.env file into .env file and replace all values with yours. (Reference given in sample.env file)
*  inside the .\api\ directory run ``` npm run start ``` to start the backend server.
*  inside the .\client\ run ``` npm run start ``` to run the expo metro bundler and press w to open or web the respective keys to emulate on ios and android.

# How to run the app on mobile devices
 Download the 'Expo Go' app on App Store or Play Store and scan the qr code provided when runnin the metro bundler.

 # Note  

Since this is in development, if youre using your mobile devices to run the app navigate to .\client\app\util.js and change the value of 'ipURL' to your laptops ip Address. To get your ip address, go to terminal and run ``` ip config ```
If you are emulating the device on the same computer as the metro bundler, change the value of 'ipURL' to ```localhost ```


Local APK build for android link (https://expo.dev/artifacts/eas/wMhdXicVQuC67h6BJ4H1uF.apk)


