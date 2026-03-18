import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/orders',
})
export class OrdersGateway {
  @WebSocketServer()
  server: Server;

  /** Client/Courier subscribes to updates for a specific order */
  @SubscribeMessage('joinOrder')
  handleJoin(
    @MessageBody() orderId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`order-${orderId}`);
    client.emit('joinedOrder', { orderId });
  }

  /** Broadcast new order status to all subscribers of that order */
  broadcastStatus(orderId: number, order: any) {
    this.server.to(`order-${orderId}`).emit('orderStatusChanged', order);
  }
}
