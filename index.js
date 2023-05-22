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
			maxsize: 5242880,
			maxFiles: 5,
		}),
		new transports.Console(),
	],
});

app.get("/sample", function (req, res) {
	let data = [
		{
			label: "Kejadian",
			kitab: "Kej",
			pasal: 50,
			kategory: "PL",
		},
		{
			label: "Keluaran",
			kitab: "Kel",
			pasal: 40,
			kategory: "PL",
		},
		{
			label: "Imamat",
			kitab: "Ima",
			pasal: 27,
			kategory: "PL",
		},
		{
			label: "Bilangan",
			kitab: "Bil",
			pasal: 36,
			kategory: "PL",
		},
		{
			label: "Ulangan",
			kitab: "Ula",
			pasal: 34,
			kategory: "PL",
		},
		{
			label: "Yosua",
			kitab: "Yos",
			pasal: 24,
			kategory: "PL",
		},
		{
			label: "Hakim-Hakim",
			kitab: "Hak",
			pasal: 21,
			kategory: "PL",
		},
		{
			label: "Rut",
			kitab: "Rut",
			pasal: 4,
			kategory: "PL",
		},
		{
			label: "Bilangan",
			kitab: "Ima",
			pasal: 36,
			kategory: "PL",
		},
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
		var arr = arrayRange(1, pasal, 1);
		arr.forEach(async (j) => {
			let url = "http://alkitab.mobi/tb/" + kitab + "/" + j;
			//logger.info("Kitab : " + kitab + ", Pasal : " + j);

			await fetch(url)
				.then((response) => {
					logger.info(
						"Kitab :" +
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
							log += `INSERT INTO tb_alkitab_id(kategory, kitab, pasal, ayat, firman, flag) values ('${kategory}','${kitab}','${j}','${verse}','${content}','${type}')\n`;
						}
					});
					logger.info(log);
					// res.json(items);
				})
				.catch((error) => {
					logger.error(error);
				});
		});
		//l; //ogger.info("============== End Kitab : " + kitab + " ==================");
	});
});
app.get("/:version/:book/:chapter", function (req, res) {
	let { version, book, chapter } = req.params;
	let items = [];
	//let url = `http://alkitab.mobi/${version}/passage/${query}`;
	for (var i = 0; i <= 50; i++) {
		let url = `http://alkitab.mobi/${version}/${book}/` + i;
		console.log(url);
		fetch(url)
			.then((response) => response.text())
			.then((body) => {
				let $ = cheerio.load(body);

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
					}
					logger.info("Pasal : " + i + ",Ayat : " + verse);
				});

				// res.json(items);
			});
	}
	//res.json({ err_code: "0", response: items, messages: "Success" });
});

app.listen(port);
console.log("[Message]" + " Server Running :" + port);
