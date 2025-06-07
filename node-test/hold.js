const fs = require('fs')
const puppeteer = require('puppeteer')
const path = require('path');
const pLimit = require('p-limit');
request = require('request');

const limit = pLimit.default ? pLimit.default(10) : pLimit(10); // limit to 10 concurrent downloads

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

async function getChapterImages(chapterUrl, browser) {
    const page = await browser.newPage();
    await page.goto(chapterUrl, { waitUntil: 'networkidle2' });

    await page.waitForSelector('img');

    const images = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img')).map(img => img.src);
    });

    await page.close();
    return images;
}

async function downloadAllImages(urls, chapter) {
    if (!fs.existsSync(`images/${chapter}`)) fs.mkdirSync(`images/${chapter}`);
    const tasks = urls.map((url, i) => {
        const ext = path.extname(new URL(url).pathname) || '.jpg';
        const filename = path.join('images', `img${i}${ext}`);
        return limit(() => downloadImages(url, filename, function () { }));
    });
    await Promise.allSettled(tasks);
    console.log('All downloads attempted.');
}

async function downloadImages(uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        // console.log('content-type:', res.headers['content-type']);
        // console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

async function download(chapters, browser) {
    if (!fs.existsSync('images')) fs.mkdirSync('images');
    for (chapter of chapters) {
        var chapterNumber = chapter.text.substr(chapter.text.length - 3);
        const chapterImages = await getChapterImages(chapter.href, browser);

        await downloadAllImages(chapterImages, chapterNumber);

    }
}



try {
    (async () => {
        const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
        const page = await browser.newPage()

        await page.goto('https://weebcentral.com/series/01J76XY7E5E1C5Y9J0M2FCVQ8H/Fairy-Tail')


        await page.click('button.hover\\:bg-base-300.p-2');
        await page.waitForSelector('button.hover\\:bg-base-300.p-2', { hidden: true/*, timeout: 5000 */ });
        console.log('loaded')

        const elements = await page.$$('#chapter-list.flex.flex-col.mt-2.divide-y.divide-slate-500 > .flex.items-center');
        console.log('Found ' + elements.length + ' elements');

        const chapters = await Promise.all(elements.map(el =>
            el.evaluate(node => {
                const anchor = node.querySelector('a');
                return {
                    href: anchor ? anchor.href : null,
                    text: node.querySelector('span.grow span')?.textContent.trim() ?? null
                };
            })
        ));
        console.log('Found ' + chapters.length + ' chapters');
        download(chapters, browser);

        /*
        // console.log(chapters);
        
        console.log(chapters[3].href, ' ', chapters[3].text);

        const chapterImages = await getChapterImages(chapters[3].href, browser);
        console.log('Found ' + chapterImages.length + ' images');

        for (let i = 0; i < chapterImages.length; i++) {
            console.log('Image ' + i + ': ' + chapterImages[i]);
        }

        await downloadAllImages(chapterImages, chapter);
        */
    })()
} catch (err) {
    console.error(err)
}