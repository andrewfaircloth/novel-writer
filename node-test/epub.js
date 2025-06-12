import Epub from "epub-gen";
import path from "path";
import { fileURLToPath } from "url";
import { Book, Chapter } from "./book.js";
import fs from 'fs';
import puppeteer from 'puppeteer';

import pLimit from 'p-limit';
import axios from 'axios';


const limit = pLimit.default ? pLimit.default(10) : pLimit(10); // limit to 10 concurrent downloads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
const myBook = new Book("Nisekoi", "Naoshi Komi");
const chapters = [
    new Chapter("Chapter_1", "https://weebcentral.com/series/01J76XY7F84AQF7DNFA0865TGQ/Nisekoi/1", ["img0.png", "img1.png", "img2.png"]),
    new Chapter("Chapter_2", "https://weebcentral.com/series/01J76XY7F84AQF7DNFA0865TGQ/Nisekoi/2", ["img0.png", "img1.png", "img2.png"]),
];
myBook.addChapters(chapters);
myBook.addCover("images/chapter_229/img5.png");

// Use rawData for HTML content
const content = myBook.chapters.map(chapter => ({
    title: chapter.title,
    data: chapter.imagePaths.map(img => {
        // Use images/Chapter_1/img0.png as src
        const tag = `<img src="${chapter.folder}/${img}" alt="${img}"/>`;
        console.log(tag);
        return tag;
    }).join('\n')
}));
*/

async function downloadImages(url, filename, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await axios.get(url, { responseType: 'stream', timeout: 20000 });
            await new Promise((resolve, reject) => {
                const stream = response.data.pipe(fs.createWriteStream(filename));
                stream.on('finish', resolve);
                stream.on('error', reject);
            });
            return;
        } catch (err) {
            console.error(`Error downloading ${url} (attempt ${attempt}): ${err.message}`);
            if (attempt === retries) {
                console.error(`Failed to download ${url} after ${retries} attempts.`);
            } else {
                await new Promise(res => setTimeout(res, 2000));
            }
        }
    }
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

async function downloadAllImages(chapterImageURLS, chapterFolder, chapter) {
    if (!fs.existsSync(`images/${chapterFolder}`)) fs.mkdirSync(`images/${chapterFolder}`);
    const tasks = chapterImageURLS.map((url, i) => {
        const ext = path.extname(new URL(url).pathname);
        if (!ext) return null;

        const filename = path.join(`images/${chapterFolder}`, `img${i}${ext}`);
        chapter.addimage(`img${i}${ext}`);
        return limit(() => downloadImages(url, filename));
    });
    await Promise.allSettled(tasks);
    console.log(`chapter ${chapterFolder} downloads attempted.`);
}

async function getChapterURLS(myBook, browser) {
    if (!myBook instanceof Book) {
        console.error("Invalid chapters format in getChapterURLS function.");
        return;
    }
    const chapterImageURLS = [];

    const chapter = myBook.chapters[1];
    const chapterImages = await getChapterImages(chapter.link, browser);
    chapterImageURLS.push(chapterImages);

    return chapterImageURLS;
}

async function download(myBook, browser) {
    if (!myBook instanceof Book) {
        console.error("Invalid chapters format in download function.");
        return;
    }
    if (!fs.existsSync('images')) fs.mkdirSync('images');
    for (let i = 0; i < myBook.chapters.length; i++) {
        const chapter = myBook.chapters[i];

        const safeTitle = chapter.title.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '_');
        const chapterFolder = `${safeTitle}`;
        const chapterImageURLS = await getChapterImages(chapter.link, browser);
        console.log(chapterImageURLS);
        await downloadAllImages(chapterImageURLS, chapterFolder, chapter);
    }
}

try {
    (async () => {
        const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
        const page = await browser.newPage()

        await page.goto('https://weebcentral.com/series/01JQEEGZBEX61ZXYPEJFVTEC4W/mrchen-crown')


        await page.click('button.hover\\:bg-base-300.p-2');
        await page.waitForSelector('button.hover\\:bg-base-300.p-2', { hidden: true });
        console.log('loaded')

        const elements = await page.$$('#chapter-list.flex.flex-col.mt-2.divide-y.divide-slate-500 > .flex.items-center');
        console.log('Found ' + elements.length + ' elements');

        const chapterObj = await Promise.all(elements.map(el =>
            el.evaluate(node => {
                const anchor = node.querySelector('a');
                return {
                    href: anchor ? anchor.href : null,
                    text: node.querySelector('span.grow span')?.textContent.trim() ?? null
                };
            })
        ));
        console.log('Found ' + chapterObj.length + ' chapters');
        const myBook = new Book('Nisekoi', 'Naoshi Komi');
        const chapterList = chapterObj.map(ch => new Chapter(ch.text, ch.href));
        myBook.addChapters(chapterList);
        // myBook.display();

        let urls = await getChapterURLS(myBook, browser)
        console.log(urls);

        await browser.close();

        const flatUrls = urls.flat();
        const content = [
            {
                title: 'Test Chapter',
                data: flatUrls.filter(Boolean).map(imgUrl => `<img src="${imgUrl}" alt="image"/>`).join('\n')
            }
        ];

        const options = {
            title: 'Test Book',
            author: 'Test Author',
            cover: 'https://scans-hot.planeptune.us/manga/mrchen-crown/0009-005.png',
            content,
            verbose: true,
            appendChapterTitles: false,
            output: path.join(__dirname, "test-epubgen.epub"),
        };

        new Epub(options).promise.then(() => {
            console.log("EPUB generated successfully with epub-gen!");
        }).catch(err => {
            console.error("EPUB generation failed:", err);
        });
    })()
} catch (err) {
    console.error(err)
}



