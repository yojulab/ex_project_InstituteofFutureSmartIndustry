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

import fs from 'fs';

function getDockerHostGateway(): string | null {
  try {
    if (!fs.existsSync('/proc/net/route')) return null;
    const route = fs.readFileSync('/proc/net/route', 'utf-8');
    for (const line of route.split('\n')) {
      const parts = line.trim().split(/\s+/);
      if (parts[1] === '00000000' && parts[2] && parts[2].length === 8) {
        const hex = parts[2];
        const b1 = parseInt(hex.substring(6, 8), 16);
        const b2 = parseInt(hex.substring(4, 6), 16);
        const b3 = parseInt(hex.substring(2, 4), 16);
        const b4 = parseInt(hex.substring(0, 2), 16);
        return `${b1}.${b2}.${b3}.${b4}`;
      }
    }
  } catch {
    // Ignore route reading errors
  }
  return null;
}

function hasMongodBinary(): boolean {
  try {
    execSync('command -v mongod', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function resolveMongoUri(configuredUri: string): Promise<string> {
  const isLocal = configuredUri.includes('127.0.0.1') || configuredUri.includes('localhost');
  if (!isLocal) {
    return configuredUri;
  }

  const portMatch = configuredUri.match(/:(\d+)\//);
  const port = portMatch ? parseInt(portMatch[1], 10) : 27017;

  // 1. 127.0.0.1 포트 오픈 확인
  const isRunning = await checkPortOpen(port, '127.0.0.1');
  if (isRunning) return configuredUri;

  // 2. Docker 컨테이너 환경 감지: 호스트 브릿지 게이트웨이 포트 확인
  const gateway = getDockerHostGateway();
  if (gateway && gateway !== '127.0.0.1') {
    const isGatewayRunning = await checkPortOpen(port, gateway);
    if (isGatewayRunning) {
      const redirectedUri = configuredUri
        .replace('//127.0.0.1:', `//${gateway}:`)
        .replace('//localhost:', `//${gateway}:`);
      console.log(`[DB] Docker container detected. Bridging MongoDB to host gateway (${gateway}:${port}).`);
      return redirectedUri;
    }
  }

  // 3. mongod 바이너리가 존재하는 경우에만 로컬 데몬 자동 기동 시도
  if (hasMongodBinary()) {
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
          return configuredUri;
        }
      }
    } catch (err) {
      console.warn('[DB] Automatic mongod startup skipped or failed:', err);
    }
  } else {
    console.log(`[DB] Note: Port ${port} is not listening and mongod binary is not present in container.`);
  }

  return configuredUri;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = (async () => {
      const baseUri = getDatabaseUri();
      const uri = await resolveMongoUri(baseUri);

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
