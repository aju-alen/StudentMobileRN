import { io } from "socket.io-client";
import {Platform} from 'react-native';



export const BaseUrl  = () => Platform.OS === 'android' ? 'http://10.0.2.2:8081' : 'http://localhost:8081'; 

// export const socket = io.connect("http://10.65.3.52:3000");

export const socket = io.connect("https://studentmobilern-31oo.onrender.com");
// export const socket = io.connect(process.env.EXPO_PUBLIC_WS_URL);

// https://studentmobilern-31oo.onrender.com 
// backend url