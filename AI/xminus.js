const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const cheerio = require("cheerio");

class XMinusVocalCut {
    constructor() {
        this.baseUrl = "https://x-minus.pro";
        this.uploadUrl =
            "https://mmd.uvronline.app/upload/vocalCutAi?catch-file";
        this.checkUrl =
            "https://mmd.uvronline.app/upload/vocalCutAi?check-job-status";
        this.downloadBase =
            "https://mmd.uvronline.app/dl/vocalCutAi";

        this.http = axios.create({
            headers: {
                "user-agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
            withCredentials: true,
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
        });

        this.authKey = null;
    }

    async getAuthKey() {
        if (this.authKey) return this.authKey;

        const res = await this.http.get(`${this.baseUrl}/ai`);
        const $ = cheerio.load(res.data);
        const authKey = $("#vocal-cut-auth-key").val();

        if (!authKey) throw new Error("Auth key tidak ditemukan");

        this.authKey = authKey;
        return authKey;
    }

    async uploadAudio(filePath) {
        const authKey = await this.getAuthKey();

        if (!fs.existsSync(filePath)) {
            throw new Error("File audio tidak ditemukan");
        }

        const form = new FormData();
        form.append("auth_key", authKey);
        form.append("locale", "en_US");
        form.append("separation", "inst_vocal");
        form.append("separation_type", "vocals_music");
        form.append("format", "mp3");
        form.append("version", "3-4-0");
        form.append("model", "mdx_v2_vocft");
        form.append("aggressiveness", "2");
        form.append("lvpanning", "center");
        form.append("uvrbve_ct", "auto");
        form.append("pre_rate", "100");
        form.append("bve_preproc", "auto");
        form.append("show_setting_format", "0");
        form.append("hostname", "x-minus.pro");
        form.append("client_fp", "-");

        form.append(
            "myfile",
            fs.createReadStream(filePath),
            {
                filename: "audio.mp3",
                contentType: "audio/mpeg",
            }
        );

        const res = await this.http.post(this.uploadUrl, form, {
            headers: {
                ...form.getHeaders(),
                origin: "https://x-minus.pro",
                referer: "https://x-minus.pro/",
            },
        });

        return res.data;
    }

    async checkJobStatus(jobId) {
        const form = new FormData();
        form.append("job_id", jobId);
        form.append("auth_key", this.authKey);
        form.append("locale", "en_US");

        const res = await this.http.post(this.checkUrl, form, {
            headers: {
                ...form.getHeaders(),
                origin: "https://x-minus.pro",
                referer: "https://x-minus.pro/",
            },
        });

        return res.data;
    }

    /**
     * Build download URLs ketika status DONE
     */
    buildDownloadUrls(jobId) {
        return {
            instrumental: `${this.downloadBase}?job-id=${jobId}&stem=inst&fmt=mp3&cdn=0`,
            vocal: `${this.downloadBase}?job-id=${jobId}&stem=vocal&fmt=mp3&cdn=0`,
        };
    }

    /**
     * Full pipeline: upload → poll → return URLs
     */
    async separateAudio(filePath, intervalMs = 3000) {
        const upload = await this.uploadAudio(filePath);
        const jobId = upload.job_id;

        let status;
        do {
            await new Promise(r => setTimeout(r, intervalMs));
            status = await this.checkJobStatus(jobId);
        } while (status.status === "processing");

        if (status.status !== "done") {
            throw new Error("Job gagal: " + (status.err_msg || "unknown"));
        }

        return {
            job_id: jobId,
            worker: status.worker_sd,
            ...this.buildDownloadUrls(jobId),
        };
    }
}

/*
(async () => {
    try {
        const vocalCut = new XMinusVocalCut();
        const result = await vocalCut.separateAudio("lagu2.mp3");
        console.log(result);
    } catch (err) {
        console.error("ERROR:", err.message);
    }
})();
*/
