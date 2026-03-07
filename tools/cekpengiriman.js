const VALID_KURIR = {
  anteraja: "AnterAja",
  ems: "EMS (Express Mail Service)",
  dse: "DSE (21 Express)",
  first: "First Logistics",
  gtl: "GoTo Logistics",
  ide: "ID Express",
  idl: "IDL Cargo",
  indah: "Indah Logistik Cargo",
  jnt: "J&T Express",
  jtcargo: "J&T Cargo",
  jet: "JET Express",
  jne: "JNE",
  jtl: "JTL Express",
  kgx: "KGXpress",
  lex: "Lazada Express",
  lion: "Lion Parcel",
  ninja: "Ninja Xpress",
  paxel: "Paxel",
  pcp: "PCP",
  pos: "Pos Indonesia",
  rex: "REX Express",
  rpx: "RPX",
  rosalia: "Rosalia Express",
  sap: "SAP Express",
  sentral: "Sentral Cargo",
  sicepat: "SiCepat",
  spx: "Shopee Express",
  star: "Star Cargo",
  tiki: "Tiki",
  tokopedia: "Tokopedia",
  troben: "Troben",
  wahana: "Wahana",
  yatama: "Yatama Air"
};

function validateKurir(kurir) {

  if (!kurir) {
    throw new Error("Kurir tidak boleh kosong");
  }

  kurir = kurir.toLowerCase();

  if (!VALID_KURIR[kurir]) {
    throw new Error(
      `Kurir tidak valid. Pilih salah satu: ${Object.keys(VALID_KURIR).join(", ")}`
    );
  }

  return {
    code: kurir,
    name: VALID_KURIR[kurir]
  };
}

function parseTracking(html) {

  html = html.replace(/\r?\n|\r/g, "");

  const courierMatch = html.match(/panel-heading'>(.*?)<\/div>/);
  const courier = courierMatch ? courierMatch[1].trim() : "Unknown Courier";

  const resiMatch = html.match(/<td>No\. Resi<\/td>\s*<td>(.*?)<\/td>/);
  const resi = resiMatch ? resiMatch[1].trim() : "-";

  const history = [];
  const regex = /<tr><td>(.*?)<\/td><\/tr>/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    history.push(match[1].trim());
  }

  let text = `Kurir : ${courier}\n`;
  text += `No Resi : ${resi}\n\n`;
  text += `Riwayat Pengiriman:\n`;

  history.forEach((h, i) => {
    text += `${i + 1}. ${h}\n`;
  });

  return text;
}

async function cekResi(resi, kurir) {

  const kurirValid = validateKurir(kurir);

  const pageUrl = `https://www.cekpengiriman.com/cek-resi?resi=${resi}&kurir=${kurirValid.code}`;

  const pageRes = await fetch(pageUrl, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
      "accept":
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
  });

  const html = await pageRes.text();
  const cookie = pageRes.headers.get("set-cookie");

  const tokenMatch = html.match(/formData\.append\("token",\s*"([^"]+)"\)/);

  if (!tokenMatch) {
    throw new Error("Token tidak ditemukan");
  }

  const token = tokenMatch[1];
  const formData = new FormData();
  formData.append("token", token);
  formData.append("resi", resi);
  formData.append("kurir", kurirValid.code);

  const res = await fetch(
    "https://www.cekpengiriman.com/wp-content/themes/simple/includes/widget/resultResi.php",
    {
      method: "POST",
      body: formData,
      headers: {
        "accept": "*/*",
        "origin": "https://www.cekpengiriman.com",
        "referer": pageUrl,
        "cookie": cookie,
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36"
      }
    }
  );

  const resultHtml = await res.text();
return parseTracking(resultHtml)
  
}

// return await cekResi("SPXID***********", "spx");
