import { NextApiRequest, NextApiResponse } from 'next';
import { Server as NetServer } from 'http';
import { SocketServer } from '@/lib/socket';

export default function SocketHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (res.socket) {
    const httpServer: NetServer = res.socket.server as any;
    
    // Initialize Socket.IO server if it doesn't exist
    if (!httpServer.io) {
      console.log('Initializing Socket.IO server...');
      const socketServer = SocketServer.getInstance(httpServer);
      httpServer.io = socketServer.io;
    }
  }
  
  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};
