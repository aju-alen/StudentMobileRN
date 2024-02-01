import { io } from "socket.io-client";
import {Platform} from 'react-native';


export const BaseUrl  = () => Platform.OS === 'android' ? 'http://10.0.2.2:8081' : 'http://localhost:8081'; 

export const socket = io.connect("http://10.65.0.144:3000");