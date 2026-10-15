import mongoose from 'mongoose';
import { getDatabaseUri } from '@/lib/config/env';
import { execSync } from 'child_process';
import net from 'net';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  memoryServer?: any;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

function checkPortOpen(port: number, host = '127.0.0.1', timeoutMs = 800): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function ensureLocalMongoService(uri: string): Promise<void> {
  const isLocal = uri.includes('127.0.0.1') || uri.includes('localhost');
  if (!isLocal) return;

  const portMatch = uri.match(/:(\d+)\//);
  const port = portMatch ? parseInt(portMatch[1], 10) : 27017;

  const isRunning = await checkPortOpen(port, '127.0.0.1');
  if (isRunning) return;

  try {
    console.log(`[DB] Local MongoDB not running on port ${port}. Attempting to launch daemon...`);
    execSync(
      `mkdir -p /root/data/db && mongod --dbpath /root/data/db --fork --logpath /root/data/mongod.log --bind_ip 127.0.0.1 --port ${port}`,
      { stdio: 'ignore' }
    );

    for (let i = 0; i < 15; i++) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (await checkPortOpen(port, '127.0.0.1')) {
        console.log(`[DB] Local MongoDB daemon online on port ${port}.`);
        return;
      }
    }
  } catch (err) {
    console.warn('[DB] Automatic mongod startup skipped or failed:', err);
  }
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = (async () => {
      const uri = getDatabaseUri();
      await ensureLocalMongoService(uri);

      const opts: mongoose.ConnectOptions = {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      };

      const conn = await mongoose.connect(uri, opts);
      return conn;
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
