const http = require('http');

http.get('http://localhost:3000/api/totems', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        try {
            const json = JSON.parse(data);
            console.log('Response body:', JSON.stringify(json, null, 2));
        } catch (e) {
            console.log('Response raw:', data);
        }
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
