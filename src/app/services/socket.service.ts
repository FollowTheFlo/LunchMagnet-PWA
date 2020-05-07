import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import * as io from 'socket.io-client';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {

   
    constructor(private socket: Socket) {}
    

    public sendMessage(eventName: string, data: any) {
        this.socket.emit(eventName, data);
    }

    public getMessages(eventName: string) {
       return this.socket
       .fromEvent<any>(eventName);
    }
    

}