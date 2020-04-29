import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import * as io from 'socket.io-client';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {

   
    constructor(private socket: Socket) {}
    

    public sendMessage(message: string) {
        this.socket.emit('new-message', message);
    }

    public getMessages = () => {
       return this.socket
       .fromEvent('ORDER_CREATED');
    }
    

}