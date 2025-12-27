class ImageEditor {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = "https://image-editor.org";
    }

    async #fetchData(url, siteKey, type, proxy) {
        const api = `https://anabot.my.id/api/tools/bypass?url=${encodeURIComponent(url)}&siteKey=${encodeURIComponent(siteKey)}&type=${encodeURIComponent(type)}&proxy=${encodeURIComponent(proxy)}&apikey=${encodeURIComponent(this.apiKey)}`;

        const options = {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        };

        try {
            const res = await fetch(api, options);
            const json = await res.json();
            return json.data.result.token;
        } catch (err) {
            console.error('error:' + err);
            throw err;
        }
    }

    #generateUserUUID() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0;
            var v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    async generateImage(prompt, imageSize = "1:1",) {
        const turnstileToken = await this.#fetchData(
            this.baseUrl,
            "0x4AAAAAACE-XLGoQUckKKm_",
            "turnstile-min",
            ""
        );

        if (!turnstileToken) {
            throw new Error("Failed to get Turnstile token.");
        }

        const userUUID = this.#generateUserUUID();

        const payload = {
            prompt: prompt,
            image_size: imageSize,
            turnstileToken: turnstileToken,
            userUUID: userUUID
        };

        const headers = {
            'Content-Type': 'application/json',
            'origin': this.baseUrl,
            'priority': 'u=1, i',
            'referer': `${this.baseUrl}/`,
        };

        try {
            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Image generation failed: ${errorData.error || response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error generating image:', error);
            throw error;
        }
    }

    async getResult(taskId) {
        const url = `${this.baseUrl}/api/task/${taskId}`;
        const headers = {
            'origin': this.baseUrl,
            'priority': 'u=1, i',
            'referer': `${this.baseUrl}/`,
        };

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: headers,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to get task result: ${errorData.error || response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting task result:', error);
            throw error;
        }
    }
}

// Example Usage:
/*
(async () => {
    const imageEditor = new ImageEditor("freeApikey"); // Replace with your actual API key
    const prompt = "cat with butterfly";
    const imageSize = "1:1";

    try {
        const generateResult = await imageEditor.generateImage(prompt, imageSize);
        console.log("Generate Result:", generateResult);

        if (generateResult.success && generateResult.data && generateResult.data.taskId) {
            const taskId = generateResult.data.taskId;
            let taskStatus = null;
            let finalResult = null;

            // Polling for result
            while (!finalResult || finalResult.data.status !== 'completed') {
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds
                taskStatus = await imageEditor.getResult(taskId);
                console.log("Task Status:", taskStatus.data.status);
                if (taskStatus.data.status === 'completed') {
                    finalResult = taskStatus;
                } else if (taskStatus.data.status === 'failed') {
                    throw new Error("Image generation task failed.");
                }
            }
            console.log("Final Image Result:", finalResult.data.result);
        }
    } catch (error) {
        console.error("Failed to generate or get image result:", error.message);
    }
})();
*/
