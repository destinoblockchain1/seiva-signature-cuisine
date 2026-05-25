import { Readable } from 'node:stream';
import handler from '../dist/server/server.js';

export default async function (req, res) {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const url = new URL(req.url, `${protocol}://${host}`);
  
  const method = req.method;
  
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      if (Array.isArray(value)) {
        for (const val of value) {
          headers.append(key, val);
        }
      } else {
        headers.set(key, value);
      }
    }
  }
  
  let body = null;
  if (method !== 'GET' && method !== 'HEAD') {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    body = Buffer.concat(chunks);
  }
  
  const webRequest = new Request(url, {
    method,
    headers,
    body,
    duplex: 'half'
  });
  
  try {
    const webResponse = await handler.fetch(webRequest);
    
    res.statusCode = webResponse.status;
    res.statusMessage = webResponse.statusText;
    
    webResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        const cookies = webResponse.headers.getSetCookie();
        res.setHeader('set-cookie', cookies);
      } else {
        res.setHeader(key, value);
      }
    });
    
    if (webResponse.body) {
      const reader = webResponse.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}
