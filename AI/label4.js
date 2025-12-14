/*
Author: anabot.my.id 
channel: https://whatsapp.com/channel/0029VaEo7EqH5JM74UhNHi2c
bebas bre mau di hapus atau ga authornya...
*/
const axios = require("axios");
const https = require("https");
const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});
async function sendChat(prompt) {
    const url = "https://37.187.99.30/waterbot/api/v1.0/chat";

    const payload = {
        prompt
    };

    const headers = {
        "content-type": "application/json",
        "origin": "https://37.187.99.30",
        "referer": "https://37.187.99.30/",
        "host": "37.187.99.30",
        "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
    };

    const response = await axios.post(url, payload, {
        headers,
        httpsAgent,
        timeout: 30000
    });
    return response.data
}
/*
const prompt = "hai";
sendChat(prompt).then(console.log).catch(err => {
    if (err.response) {
        console.error("HTTP Error:", err.response.status);
        console.error(err.response.data);
    } else {
        console.error("Request Error:", err.message);
    }
});
*/
