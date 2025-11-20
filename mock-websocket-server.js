import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 9090 });

console.log('🚀 Mock WebSocket Server running on ws://localhost:9090');

// Sample city coordinates (Ho Chi Minh City area)
const CITY_CENTER = { lat: 10.8231, lon: 106.6297 };
const CITY_RADIUS = 0.05; // ~5km radius

// Alert types
const ALERT_TYPES = ['fire', 'traffic', 'aqi'];
const SOURCES = [
    'Camera AI #101',
    'Camera AI #204',
    'IoT Sensor #A45',
    'IoT Sensor #B72',
    'Environmental Monitor #E12',
    'Traffic Monitor #T33',
];

const DESCRIPTIONS = {
    fire: [
        'Smoke detected in industrial area',
        'Fire alarm triggered at building',
        'Heat signature anomaly detected',
        'Smoke plume visible from camera',
    ],
    traffic: [
        'Vehicle collision reported',
        'Heavy congestion detected',
        'Road obstruction identified',
        'Traffic signal malfunction',
    ],
    aqi: [
        'PM2.5 levels exceed safe threshold',
        'Hazardous pollutants detected',
        'Air quality degradation alert',
        'Chemical emissions detected',
    ],
};

// Generate random coordinate within city bounds
function randomCoordinate() {
    const randomOffset = () => (Math.random() - 0.5) * CITY_RADIUS * 2;
    return {
        lat: CITY_CENTER.lat + randomOffset(),
        lon: CITY_CENTER.lon + randomOffset(),
    };
}

// Generate random alert
function generateAlert() {
    const type = ALERT_TYPES[Math.floor(Math.random() * ALERT_TYPES.length)];
    const coord = randomCoordinate();
    const descriptions = DESCRIPTIONS[type];

    return {
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        lat: coord.lat,
        lon: coord.lon,
        timestamp: new Date().toISOString(),
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
    };
}

// Generate metrics data
let throughputData = Array.from({ length: 10 }, () => Math.floor(Math.random() * 50) + 20);

function generateMetrics() {
    // Shift array and add new value (simulating scrolling window)
    throughputData.shift();
    throughputData.push(Math.floor(Math.random() * 60) + 15);

    return {
        throughput: [...throughputData],
        breakdown: {
            hot: Math.floor(Math.random() * 50) + 10,
            warm: Math.floor(Math.random() * 100) + 30,
            cold: Math.floor(Math.random() * 200) + 100,
        },
        timestamp: Date.now(),
    };
}

// Broadcast to all connected clients
function broadcast(message) {
    const data = JSON.stringify(message);
    wss.clients.forEach(client => {
        if (client.readyState === 1) { // WebSocket.OPEN
            client.send(data);
        }
    });
}

// Handle client connections
wss.on('connection', (ws) => {
    console.log('✅ Client connected');

    ws.on('close', () => {
        console.log('❌ Client disconnected');
    });

    ws.on('error', (error) => {
        console.error('⚠️  WebSocket error:', error.message);
    });
});

// Send random alerts every 0-5 minutes
setInterval(() => {
    const alert = generateAlert();
    console.log(`📢 Alert: ${alert.type} at (${alert.lat.toFixed(4)}, ${alert.lon.toFixed(4)})`);

    broadcast({
        type: 'alert',
        data: alert,
    });
}, Math.random() * 5 * 60 * 1000); // 0-5 minutes in milliseconds

// Send metrics every 1 second
setInterval(() => {
    const metrics = generateMetrics();

    broadcast({
        type: 'metrics',
        data: metrics,
    });
}, 1000);

// Occasionally resolve old alerts (for demo purposes)
setInterval(() => {
    if (Math.random() > 0.7) {
        broadcast({
            type: 'alert_resolved',
            data: { id: 'demo-resolved-id' },
        });
    }
}, 10000);

console.log('');
console.log('💡 Server will send:');
console.log('   - Random alerts every 0-5 minutes');
console.log('   - Metrics updates every 1 second');
console.log('');
