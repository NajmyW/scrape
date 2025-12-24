const axios = require("axios")

async function gpt5(prompt){
    const {data} = await axios.post("http://138.68.100.17:3000/chatapi/proxies/openai/v1/chat/completions",{
  "model": "gpt-3.5-turbo",
  "messages": [
    {
      "role": "system",
      "content": "You are Anabot, a large language model trained by NajmyW"
    },
    {
      "role": "user",
      "content": "siapa presiden indonesia sekarang?"
    }
  ],
  "temperature": 0.5,
  "stream": true
},{headers:{
"content-type":"application/json"
}})
let b = data
  .split('\n\n')
  .filter(Boolean)

let content = ''

for (const c of b){
    if (c.includes('data: [DONE]')) continue
  const jsonStr = c.replace('data: ', '')

  try {
    const data = JSON.parse(jsonStr)
    const delta = data.choices?.[0]?.delta?.content
    if (delta) content += delta
  } catch (e) {
  }
}
  return content
}
//gpt5().then(console.log)
