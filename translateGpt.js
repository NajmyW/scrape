/*
Author: NajmyW
RestApi: anabot.my.id
*/
function translateAI(word, from, to) {
    const url = 'https://api.translasion.com/enhance/dictionary';
    const headers = {
        'Accept-Encoding': 'identity',
        'Content-Type': 'application/json; charset=UTF-8',
    };
    const data = {
        'app_key': '',
        'from': from,
        'gpt_switch': '0',
        'override_from_flag': '0',
        'scene': 100,
        'system_lang': 'en',
        'to': to,
        'word': word
    };

    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => data.data)
        .catch(error => console.error(error));
}

// translateAI('morning', 'en', 'id' ).then(result => console.log(result));

module.exports = { translateAI }
