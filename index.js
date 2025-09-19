var express = require("express");
var app = express();
var port = process.env.PORT || 3000;
var bodyParser = require("body-parser");
var path = require("path");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
var fetch = require("node-fetch");
var cheerio = require("cheerio");
var { createLogger, transports, format } = require("winston");
const logger = createLogger({
	format: format.combine(format.printf((info) => `${info.message}`)),
	transports: [
		new transports.File({
			filename: "./logs/logs.log",
			json: false,
			maxsize: 7242880,
			maxFiles: 50,
		}),
		new transports.Console(),
	],
});

async function scrapeKidung(nomor) {
  	let url = "http://alkitab.mobi/kidung/kj/" + nomor;
	await fetch(url)
				.then((response) => {
					logger.info(
						"-- Kidung Jemaat :" +
							nomor +
							", Status :" +
							response.status
					);
					return response.text();
				})
				.then((body) => {
					let $ = cheerio.load(body);
					var log = "";
					// Ambil judul lagu
					const title = $('p.paragraphtitle').text().trim().replace(/'/g, "''");

					// Ambil seluruh isi bait
					const contents = [];

					$('p').each((i, el) => {
						const text = $(el).html().trim();

						// Deteksi Reff
						if (text.includes('<i>Reff:</i>')) {
							const reff = $(el).text().replace(/Reff:/i, '').trim().replace(/'/g, "''");
							contents.push({
								type: 'reff',
								text: reff
							});
						}

						// Deteksi ayat
						else if (/^\s*<i><strong>\d+<\/strong>\.<\/i>/.test(text)) {
							const numberMatch = text.match(/<strong>(\d+)<\/strong>/);
							const number = numberMatch ? parseInt(numberMatch[1]) : null;

							const cleanText = $(el).text()
								.replace(/\d+\./, '') // hapus nomor di awal
								.replace(/Kembali ke Reff\./i, '') // hapus "Kembali ke Reff."
								.trim();

							contents.push({
								type: 'verse',
								number,
								text: cleanText.replace(/'/g, "''")
							});
						}
					});
					log += `INSERT INTO tb_kidung(judul, konten) values ('${title}','${JSON.stringify(contents)}');\n`;
					logger.info(log);
					// res.json(items);
				})
				.catch((error) => {
					logger.error("Error : Kidung Nomor: " + nomor + " : " + error);
				});
}
  //await new Promise(resolve => setTimeout(resolve, 500));
app.get("/kidung", function (req, res) {

	(async () => {
		for (let i = 1; i <= 478; i++) {
			try {
			await scrapeKidung(i); // tunggu selesai dulu sebelum lanjut
			} catch (err) {
			console.error(`Gagal scraping KJ ${i}:`, err.message);
			}
		}
  		console.log("✅ Semua kidung selesai diproses.");
	})();
});

app.get("/sample", function (req, res) {
	let data = [
		{
			"label": "Kejadian",
			"kitab": "Kej",
			"pasal": 50,
			"kategory": "PL"
		},
		{
			"label": "Keluaran",
			"kitab": "Kel",
			"pasal": 40,
			"kategory": "PL"
		},
		{
			"label": "Imamat",
			"kitab": "Ima",
			"pasal": 27,
			"kategory": "PL"
		},
		{
			"label": "Bilangan",
			"kitab": "Bil",
			"pasal": 36,
			"kategory": "PL"
		},
		{
			"label": "Ulangan",
			"kitab": "Ula",
			"pasal": 34,
			"kategory": "PL"
		},
		{
			"label": "Yosua",
			"kitab": "Yos",
			"pasal": 24,
			"kategory": "PL"
		},
		{
			"label": "Hakim-hakim",
			"kitab": "Hak",
			"pasal": 21,
			"kategory": "PL"
		},
		{
			"label": "Rut",
			"kitab": "Rut",
			"pasal": 4,
			"kategory": "PL"
		},
		{
			"label": "1 Samuel",
			"kitab": "1Sa",
			"pasal": 31,
			"kategory": "PL"
		},
		{
			"label": "2 Samuel",
			"kitab": "2Sa",
			"pasal": 24,
			"kategory": "PL"
		},
		{
			"label": "1 Raja‑raja",
			"kitab": "1Ra",
			"pasal": 22,
			"kategory": "PL"
		},
		{
			"label": "2 Raja‑raja",
			"kitab": "2Ra",
			"pasal": 25,
			"kategory": "PL"
		},
		{
			"label": "1 Tawarikh",
			"kitab": "1Ta",
			"pasal": 29,
			"kategory": "PL"
		},
		{
			"label": "2 Tawarikh",
			"kitab": "2Ta",
			"pasal": 36,
			"kategory": "PL"
		},
		{
			"label": "Ezra",
			"kitab": "Ezr",
			"pasal": 10,
			"kategory": "PL"
		},
		{
			"label": "Nehemia",
			"kitab": "Neh",
			"pasal": 13,
			"kategory": "PL"
		},
		{
			"label": "Ester",
			"kitab": "Est",
			"pasal": 10,
			"kategory": "PL"
		},
		{
			"label": "Ayub",
			"kitab": "Ayb",
			"pasal": 42,
			"kategory": "PL"
		},
		{
			"label": "Mazmur",
			"kitab": "Mzm",
			"pasal": 150,
			"kategory": "PL"
		},
		{
			"label": "Amsal",
			"kitab": "Ams",
			"pasal": 31,
			"kategory": "PL"
		},
		{
			"label": "Pengkhotbah",
			"kitab": "Pkh",
			"pasal": 12,
			"kategory": "PL"
		},
		{
			"label": "Kidung Agung",
			"kitab": "Kid",
			"pasal": 8,
			"kategory": "PL"
		},
		{
			"label": "Yesaya",
			"kitab": "Yes",
			"pasal": 66,
			"kategory": "PL"
		},
		{
			"label": "Yeremia",
			"kitab": "Yer",
			"pasal": 52,
			"kategory": "PL"
		},
		{
			"label": "Ratapan",
			"kitab": "Rat",
			"pasal": 5,
			"kategory": "PL"
		},
		{
			"label": "Yehezkiel",
			"kitab": "Yeh",
			"pasal": 48,
			"kategory": "PL"
		},
		{
			"label": "Daniel",
			"kitab": "Dan",
			"pasal": 12,
			"kategory": "PL"
		},
		{
			"label": "Hosea",
			"kitab": "Hos",
			"pasal": 14,
			"kategory": "PL"
		},
		{
			"label": "Yoel",
			"kitab": "Yoe",
			"pasal": 3,
			"kategory": "PL"
		},
		{
			"label": "Amos",
			"kitab": "Amo",
			"pasal": 9,
			"kategory": "PL"
		},
		{
			"label": "Obaja",
			"kitab": "Oba",
			"pasal": 1,
			"kategory": "PL"
		},
		{
			"label": "Yunus",
			"kitab": "Yun",
			"pasal": 4,
			"kategory": "PL"
		},
		{
			"label": "Mikha",
			"kitab": "Mik",
			"pasal": 7,
			"kategory": "PL"
		},
		{
			"label": "Nahum",
			"kitab": "Nah",
			"pasal": 3,
			"kategory": "PL"
		},
		{
			"label": "Habakuk",
			"kitab": "Hab",
			"pasal": 3,
			"kategory": "PL"
		},
		{
			"label": "Zefanya",
			"kitab": "Zef",
			"pasal": 3,
			"kategory": "PL"
		},
		{
			"label": "Hagai",
			"kitab": "Hag",
			"pasal": 2,
			"kategory": "PL"
		},
		{
			"label": "Zakharia",
			"kitab": "Zak",
			"pasal": 14,
			"kategory": "PL"
		},
		{
			"label": "Maleakhi",
			"kitab": "Mal",
			"pasal": 4,
			"kategory": "PL"
		},
		{
			"label": "Matius",
			"kitab": "Mat",
			"pasal": 28,
			"kategory": "PB"
		},
		{
			"label": "Markus",
			"kitab": "Mar",
			"pasal": 16,
			"kategory": "PB"
		},
		{
			"label": "Lukas",
			"kitab": "Luk",
			"pasal": 24,
			"kategory": "PB"
		},
		{
			"label": "Yohanes",
			"kitab": "Yoh",
			"pasal": 21,
			"kategory": "PB"
		},
		{
			"label": "Kisah Para Rasul",
			"kitab": "Kis",
			"pasal": 28,
			"kategory": "PB"
		},
		{
			"label": "Roma",
			"kitab": "Rom",
			"pasal": 16,
			"kategory": "PB"
		},
		{
			"label": "1 Korintus",
			"kitab": "1Ko",
			"pasal": 16,
			"kategory": "PB"
		},
		{
			"label": "2 Korintus",
			"kitab": "2Ko",
			"pasal": 13,
			"kategory": "PB"
		},
		{
			"label": "Galatia",
			"kitab": "Gal",
			"pasal": 6,
			"kategory": "PB"
		},
		{
			"label": "Efesus",
			"kitab": "Efe",
			"pasal": 6,
			"kategory": "PB"
		},
		{
			"label": "Filipi",
			"kitab": "Flp",
			"pasal": 4,
			"kategory": "PB"
		},
		{
			"label": "Kolose",
			"kitab": "Kol",
			"pasal": 4,
			"kategory": "PB"
		},
		{
			"label": "1 Tesalonika",
			"kitab": "1Tes",
			"pasal": 5,
			"kategory": "PB"
		},
		{
			"label": "2 Tesalonika",
			"kitab": "2Tes",
			"pasal": 3,
			"kategory": "PB"
		},
		{
			"label": "1 Timotius",
			"kitab": "1Tim",
			"pasal": 6,
			"kategory": "PB"
		},
		{
			"label": "2 Timotius",
			"kitab": "2Tim",
			"pasal": 4,
			"kategory": "PB"
		},
		{
			"label": "Titus",
			"kitab": "Tit",
			"pasal": 3,
			"kategory": "PB"
		},
		{
			"label": "Filemon",
			"kitab": "Flm",
			"pasal": 1,
			"kategory": "PB"
		},
		{
			"label": "Ibrani",
			"kitab": "Ibr",
			"pasal": 13,
			"kategory": "PB"
		},
		{
			"label": "Yakobus",
			"kitab": "Yak",
			"pasal": 5,
			"kategory": "PB"
		},
		{
			"label": "1 Petrus",
			"kitab": "1Pet",
			"pasal": 5,
			"kategory": "PB"
		},
		{
			"label": "2 Petrus",
			"kitab": "2Pet",
			"pasal": 3,
			"kategory": "PB"
		},
		{
			"label": "1 Yohanes",
			"kitab": "1Yoh",
			"pasal": 5,
			"kategory": "PB"
		},
		{
			"label": "2 Yohanes",
			"kitab": "2Yoh",
			"pasal": 1,
			"kategory": "PB"
		},
		{
			"label": "3 Yohanes",
			"kitab": "3Yoh",
			"pasal": 1,
			"kategory": "PB"
		},
		{
			"label": "Yudas",
			"kitab": "Yud",
			"pasal": 1,
			"kategory": "PB"
		},
		{
			"label": "Wahyu",
			"kitab": "Why",
			"pasal": 22,
			"kategory": "PB"
		}
	];
	const arrayRange = (start, stop, step) =>
		Array.from(
			{ length: (stop - start) / step + 1 },
			(value, index) => start + index * step
		);
	data.forEach((i) => {
		var kategory = i["kategory"];
		var kitab = i["kitab"];
		var pasal = i["pasal"];
		var label = i["label"];
		var arr = arrayRange(1, pasal, 1);
		arr.forEach(async (j) => {
			let url = "http://alkitab.mobi/net/" + kitab + "/" + j;
			//logger.info("Kitab : " + kitab + ", Pasal : " + j);

			await fetch(url)
				.then((response) => {
					logger.info(
						"-- Kitab :" +
							kitab +
							", Pasal : " +
							j +
							", Status :" +
							response.status
					);
					return response.text();
				})
				.then((body) => {
					let $ = cheerio.load(body);
					let items = [];
					var log = "";
					$("p").filter((i, el) => {
						let data = $(el);
						let content = data.find("[data-begin]").first().text();
						let title = data.find(".paragraphtitle").first().text();
						let verse = data
							.find(".reftext")
							.children()
							.first()
							.text()
							.split(":")
							.pop();
						let type = null;

						if (!title && !content) {
							data.find(".reftext").remove();
							content = data.text();
						}

						if (title) {
							type = "title";
							content = title;
						} else if (content && verse != "") {
							type = "content";
						}

						if (
							data.attr("hidden") === "hidden" ||
							data.hasClass("loading") ||
							data.hasClass("error")
						) {
							type = null;
						}
						if (type) {
							items.push({ content, type, verse });
							log += `INSERT INTO tb_alkitab_id(kategory, kitab, label, pasal, ayat, firman, flag) values ('${kategory}','${kitab}','${label}','${j}','${verse}','${content}','${type}');\n`;
						}
					});
					logger.info(log);
					// res.json(items);
				})
				.catch((error) => {
					logger.error("Error : " + label + " Pasal : " + pasal + error);
				});
		});
		//l; //ogger.info("============== End Kitab : " + kitab + " ==================");
	});
});

app.listen(port);
console.log("[Message]" + " Server Running :" + port);
