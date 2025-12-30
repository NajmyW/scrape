async function gpt5(message) {
    const payload = new URLSearchParams({
        password: "freegpt",
        model: "gpt-5",
        temperature: "0.5",
        max_tokens: "3000",
        prompts: JSON.stringify([{ role: "user", content: message }])
    });

    const res = await fetch("http://107.174.1.83:82/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest"
        },
        body: payload
    });

    return await res.text();
}
// gpt5("siapa kamu?").then(response => {
//     console.log(response);
// }).catch(error => {
//     console.error("Error:", error);
// });
