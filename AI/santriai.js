>class SantriAI {
  constructor() {
    this.baseUrl = "https://santriai.com";
    this.cookie = null;
    this.hasRegistered = false;
  }

  parseCookies(setCookieHeader) {
    if (!setCookieHeader) return "";

    return setCookieHeader
      .split(/,(?=\s*[^;]+=)/)
      .map(cookie => cookie.split(";")[0].trim())
      .join("; ");
  }

  mergeCookies(oldCookie, newCookie) {
    const cookieMap = new Map();

    const addCookies = cookieString => {
      if (!cookieString) return;

      cookieString.split(";").forEach(item => {
        const [key, ...valueParts] = item.trim().split("=");

        if (key && valueParts.length) {
          cookieMap.set(key, valueParts.join("="));
        }
      });
    };

    addCookies(oldCookie);
    addCookies(newCookie);

    return [...cookieMap.entries()]
      .map(([key, value]) => `${key}=${value}`)
      .join("; ");
  }

  randomString(length = 8) {
    return Math.random()
      .toString(36)
      .substring(2, 2 + length);
  }

  randomUser() {
    const id = Date.now() + this.randomString(5);

    return {
      full_name: `User ${id}`,
      email: `user${id}@gmail.com`,
      wa_number: `08${Math.floor(1000000000 + Math.random() * 8999999999)}`,
      password: `Pass${this.randomString(8)}123`,
      gender: "Laki-laki",
      city: "Jakarta",
      birthdate: "2001-08-10",
      referral_code: ""
    };
  }

  async initCookie() {
    const response = await fetch(`${this.baseUrl}/`, {
      method: "GET",
      headers: {
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"
      }
    });

    const setCookie = response.headers.get("set-cookie");
    const parsedCookie = this.parseCookies(setCookie);

    this.cookie = this.mergeCookies(this.cookie, parsedCookie);
    this.cookie = this.mergeCookies(this.cookie, "site_lang=en; lang_prompted=1");

    if (!this.cookie.includes("PHPSESSID=")) {
      throw new Error("PHPSESSID tidak ditemukan dari response GET /");
    }

    return this.cookie;
  }

  async register() {
    if (!this.cookie) {
      await this.initCookie();
    }

    const user = this.randomUser();

    const payload = {
      action: "register",
      full_name: user.full_name,
      email: user.email,
      wa_number: user.wa_number,
      password: user.password,
      gender: user.gender,
      city: user.city,
      birthdate: user.birthdate,
      referral_code: user.referral_code
    };

    const response = await fetch(`${this.baseUrl}/api/auth_ajax.php`, {
      method: "POST",
      headers: {
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.5",
        "Content-Type": "application/json",
        "Cookie": this.cookie,
        "Origin": this.baseUrl,
        "Referer": `${this.baseUrl}/`,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "Sec-GPC": "1"
      },
      body: JSON.stringify(payload)
    });

    const setCookie = response.headers.get("set-cookie");

    if (setCookie) {
      this.cookie = this.mergeCookies(
        this.cookie,
        this.parseCookies(setCookie)
      );
    }

    const text = await response.text();

    if (!response.ok) {
      throw new Error(`Register gagal: ${response.status}\n${text}`);
    }

    this.hasRegistered = true;

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = text;
    }

    return {
      user,
      response: result
    };
  }

  async chat(message, sessionId = null) {
    if (!this.cookie) {
      await this.initCookie();
    }

    if (!this.hasRegistered) {
      await this.register();
    }

    const payload = {
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: message
            }
          ]
        }
      ],
      session_id: sessionId,
      model_id: "7",
      agent_id: null
    };

    const response = await fetch(`${this.baseUrl}/api/ai_chat`, {
      method: "POST",
      headers: {
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.5",
        "Content-Type": "application/json",
        "Cookie": this.cookie,
        "Origin": this.baseUrl,
        "Referer": `${this.baseUrl}/`,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin"
      },
      body: JSON.stringify(payload)
    });

    const setCookie = response.headers.get("set-cookie");

    if (setCookie) {
      this.cookie = this.mergeCookies(
        this.cookie,
        this.parseCookies(setCookie)
      );
    }

    const text = await response.text();

    if (!response.ok) {
      throw new Error(`Chat gagal: ${response.status}\n${text}`);
    }

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
}
/*
const ai = new SantriAI();
const result = await ai.chat("halo");
return result
*/
