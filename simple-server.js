const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 10000;

const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    if (req.method === 'PUT' && req.url === '/proxy') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            console.log('📨 Received from ESP32:', body);
            
            const options = {
                hostname: 'shuttle-tracker-44e07-default-rtdb.asia-southeast1.firebasedatabase.app',
                path: '/gps.json?auth=OB9Du1PPtUKyVlyfO1cUwMFf274Ih7TvAK3tBnQ3',
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(body)
                }
            };
            
            const firebaseReq = https.request(options, (firebaseRes) => {
                let responseData = '';
                
                firebaseRes.on('data', (chunk) => {
                    responseData += chunk;
                });
                
                firebaseRes.on('end', () => {
                    console.log('✅ Firebase response:', firebaseRes.statusCode);
                    res.writeHead(firebaseRes.statusCode, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(responseData);
                });
            });
            
            firebaseReq.on('error', (error) => {
                console.log('❌ Error:', error);
                res.writeHead(500, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({ error: error.message }));
            });
            
            firebaseReq.write(body);
            firebaseReq.end();
        });
    } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('🚀 Proxy Server Running - Use PUT /proxy');
    }
});

server.listen(PORT, () => {
    console.log(`🔥 Simple Proxy server running on port ${PORT}`);
});