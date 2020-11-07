  
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var path = require("path");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
var fetch = require('node-fetch');
var cheerio = require('cheerio');
app.get('/:version/:query', function(req, res) {
    let {
        version,
        query
    } = req.params;
    // let url = `http://alkitab.mobi/${version}/${book}/${chapter}`;
    let url = `http://alkitab.mobi/${version}/passage/${query}`;

    fetch(url)
        .then(response => response.text())
        .then(body => {
            let $ = cheerio.load(body);
            let items = [];
            $('p').filter((i, el) => {
                let data = $(el);
                let content = data.find('[data-begin]').first().text();
                let title = data.find('.paragraphtitle').first().text();
                let verse = data.find('.reftext').children().first().text().split(':').pop();
                let type = null;

                if (!title && !content) {
                    data.find('.reftext').remove();
                    content = data.text();
                }

                if (title) {
                    type = 'title';
                    content = title;
                } else if (content) {
                    type = 'content';
                }

                if (data.attr('hidden') === 'hidden' || data.hasClass('loading') || data.hasClass('error')) {
                    type = null;
                }
            
                if (type)
                    items.push({
                        content,
                        type,
                        verse
                    });
            });
            res.json({err_code : "0", response : items, messages : "Success"});
            //response.Success(res, items, "Success Get Alkitab");
            // res.json(items);
        });
});

app.listen(port);
console.log('[Message]' + " Server Running :" + port);