const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.put('/proxy', async (req, res) => {
    console.log('📨 Received from ESP32:', req.body);
    
    try {
        const firebaseUrl = 'https://shuttle-tracker-44e07-default-rtdb.asia-southeast1.firebasedatabase.app/gps.json?auth=OB9Du1PPtUKyVlyfO1cUwMFf274Ih7TvAK3tBnQ3';
        
        const response = await fetch(firebaseUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
            redirect: 'follow' // Important: follow redirects
        });
        
        // Get the response data
        const responseData = await response.text();
        
        console.log('✅ Forwarded to Firebase. Status:', response.status);
        console.log('📨 Response:', responseData);
        
        // Send the exact response from Firebase
        res.status(response.status)
           .set('Content-Type', 'application/json')
           .send(responseData);
           
    } catch (error) {
        console.log('❌ Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/', (req, res) => {
    res.send('🚀 Firebase Proxy Server is Running!');
});

// Handle preflight requests
app.options('/proxy', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).send();
});

app.listen(PORT, () => {
    console.log(`🔥 Proxy server running on port ${PORT}`);
});
