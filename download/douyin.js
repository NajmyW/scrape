
/*
Author: anabot.my.id 
channel: https://whatsapp.com/channel/0029VaEo7EqH5JM74UhNHi2c
bebas bre mau di hapus atau ga authornya...
*/
const axios = require('axios');
const cheerio = require('cheerio');

function calculateHash(url, salt) {
    const urlBase64 = Buffer.from(url, 'utf-8').toString('base64');
    const saltBase64 = Buffer.from(salt, 'utf-8').toString('base64');
    return urlBase64 + (url.length + 1000) + saltBase64;
}

async function getDownloadToken() {
    try {
        const response = await axios.get('https://snapdouyin.app/');
        const $ = cheerio.load(response.data);

        const tokenInput = $('input#token');
        if (tokenInput.length > 0) {
            return tokenInput.attr('value');
        } else {
            throw new Error('Token not found in the webpage');
        }
    } catch (error) {
        console.error('Error fetching download token:', error.message);
        throw error;
    }
}

async function downloadDouyinVideo(videoUrl) {
    try {
        const token = await getDownloadToken();

        const hash = calculateHash(videoUrl, 'aio-dl');

        const formData = new URLSearchParams();
        formData.append('url', videoUrl);
        formData.append('token', token);
        formData.append('hash', hash);

        const response = await axios.post('https://snapdouyin.app/wp-json/mx-downloader/video-data/',
            formData,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error downloading Douyin video:', error.message);
        throw error;
    }
}
/*
async function testDownload() {
    try {
        const videoUrl = 'https://v.douyin.com/Owo5wKj2pu8/'; 
        const result = await downloadDouyinVideo(videoUrl);
        console.log('Download result:', result);
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}
testDownload();
*/
