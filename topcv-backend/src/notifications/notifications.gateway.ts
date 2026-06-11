import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { WebSocket } from 'ws';
import { IncomingMessage } from 'http';

@WebSocketGateway({ path: '/ws' })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NotificationsGateway.name);
  private readonly userSockets = new Map<string, Set<WebSocket>>();

  constructor(
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  handleConnection(client: WebSocket, req: IncomingMessage) {
    try {
      const url = new URL(req.url!, `http://localhost`);
      const token = url.searchParams.get('token');
      if (!token) {
        client.close(4001, 'Unauthorized');
        return;
      }
      const payload = this.jwt.verify(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      }) as { sub: string };
      const userId = payload.sub;
      (client as any).__userId = userId;

      if (!this.userSockets.has(userId)) this.userSockets.set(userId, new Set());
      this.userSockets.get(userId)!.add(client);
      this.logger.log(`WS connect: user=${userId} sockets=${this.userSockets.get(userId)!.size}`);
    } catch {
      client.close(4001, 'Unauthorized');
    }
  }

  handleDisconnect(client: WebSocket) {
    const userId = (client as any).__userId as string | undefined;
    if (!userId) return;
    const set = this.userSockets.get(userId);
    if (set) {
      set.delete(client);
      if (set.size === 0) this.userSockets.delete(userId);
    }
  }

  emitToUser(userId: string, event: string, data: unknown) {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return;
    const message = JSON.stringify({ event, data });
    for (const socket of sockets) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(message);
      }
    }
  }
}
