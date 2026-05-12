/*
Sumber: https://whatsapp.com/channel/0029Vb7Dpq5GZNCu2OKoZl15
*/
const { default: axios } = require("axios");
const fs = require("fs");
const FormData = require("form-data");

class CloudinaryUploader {
  constructor(mode = null) {
    this.mode = mode || 'vip';
    const configs = {
      vip: {
        cloudName: 'dtz0urit6',
        apiKey: '985946268373735',
        uploadPreset: 'cloudinary-tools',
      },
      local: {
        cloudName: 'dzvmeucb1',
        apiKey: '974144489266485',
        uploadPreset: 'ml_default',
      }
    };

    const config = configs[this.mode] || configs.vip;

    this.cloudName = config.cloudName;
    this.apiKey = config.apiKey;
    this.uploadPreset = config.uploadPreset;
    this.source = "ml";

    this.signatureUrl =
      "https://cloudinary-tools.netlify.app/.netlify/functions/sign-upload-params";
    this.uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/auto/upload`;
    this.http = axios.create({
      timeout: 30000,
      headers: { 'User-Agent': 'CloudinaryUploader/1.0' }
    });
    this.useUnsignedFallback = 'false';
    console.log(`[CloudinaryUploader] Mode: ${this.mode}`);
    console.log(`[CloudinaryUploader] Cloud: ${this.cloudName}`);
    console.log(`[CloudinaryUploader] Preset: ${this.uploadPreset}`);
  }
  async getSignature(paramsToSign) {
    try {
      const { data } = await this.http.post(this.signatureUrl, { paramsToSign });
      if (!data?.signature) {
        throw new Error('Signature not returned from endpoint');
      }
      return data.signature;
    } catch (error) {
      console.warn(`[Signature] Failed to get signature: ${error.message}`);
      return null;
    }
  }
  async upload(fileBuffer, filename = "upload.jpg", options = {}) {
    const {
      useUnsigned = null,
      publicId = null,
      folder = null,
    } = options;

    const timestamp = Math.floor(Date.now() / 1000);
    const formData = new FormData();

    const forceUnsigned = useUnsigned !== null ? useUnsigned :
      (this.useUnsignedFallback && this.mode === 'local');

    if (!forceUnsigned) {
      console.log('[Upload] Using SIGNED upload method');
      const signature = await this.getSignature({
        timestamp,
        upload_preset: this.uploadPreset,
        source: this.source,
        ...(publicId && { public_id: publicId }),
        ...(folder && { folder: folder }),
      });

      if (!signature) {
        if (this.useUnsignedFallback) {
          console.warn('[Upload] Signature failed, falling back to UNSIGNED');
          return this._uploadUnsigned(fileBuffer, filename, options);
        }
        throw new Error('Failed to generate signature and fallback is disabled');
      }

      formData.append("upload_preset", this.uploadPreset);
      formData.append("source", this.source);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp);
      formData.append("api_key", this.apiKey);
    } else {
      console.log('[Upload] Using UNSIGNED upload method');
      formData.append("upload_preset", this.uploadPreset);
    }

    if (publicId) formData.append("public_id", publicId);
    if (folder) formData.append("folder", folder);

    formData.append("file", fileBuffer, filename);

    try {
      console.log(`[Upload] Posting to: ${this.uploadUrl}`);

      const { data } = await axios.post(this.uploadUrl, formData, {
        headers: {
          ...formData.getHeaders(),
          'User-Agent': 'CloudinaryUploader/1.0'
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      console.log(`[Upload] Success: ${data.secure_url}`);
      return {
        success: true,
        data,
        url: data.secure_url,
        publicId: data.public_id,
        format: data.format,
        bytes: data.bytes,
      };

    } catch (error) {
      console.error('[Upload] ❌ Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      if (!forceUnsigned && this.useUnsignedFallback && error.response?.status) {
        console.warn('[Upload] Signed upload failed, trying UNSIGNED fallback...');
        return this._uploadUnsigned(fileBuffer, filename, options);
      }

      throw new Error(`Upload failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async _uploadUnsigned(fileBuffer, filename = "upload.jpg", options = {}) {
    const { publicId = null, folder = null } = options;

    const formData = new FormData();
    formData.append("upload_preset", this.uploadPreset);

    if (publicId) formData.append("public_id", publicId);
    if (folder) formData.append("folder", folder);
    formData.append("file", fileBuffer, filename);

    console.log(`[Upload:Unsigned] Posting to: ${this.uploadUrl}`);

    const { data } = await axios.post(this.uploadUrl, formData, {
      headers: formData.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    console.log(`[Upload:Unsigned] Success: ${data.secure_url}`);
    return {
      success: true,
      data,
      url: data.secure_url,
      publicId: data.public_id,
      format: data.format,
      bytes: data.bytes,
      method: 'unsigned'
    };
  }

  async uploadFromFile(filePath, options = {}) {
    const filename = options.filename || filePath.split('/').pop() || "upload.jpg";
    const fileBuffer = fs.readFileSync(filePath);
    return this.upload(fileBuffer, filename, options);
  }

  async uploadFromUrl(fileUrl, options = {}) {
    const filename = options.filename || fileUrl.split('/').pop() || "upload.jpg";

    console.log(`[Upload:FromURL] Downloading: ${fileUrl}`);
    const response = await axios.get(fileUrl, {
      responseType: 'arraybuffer',
      timeout: 30000
    });

    const fileBuffer = Buffer.from(response.data);
    return this.upload(fileBuffer, filename, options);
  }
}

/*
(async () => {
  const uploader = new CloudinaryUploader('vip');
  const result = await uploader.upload(fs.readFileSync("./puan.jpg"));
  console.log(result);
})()
  */
