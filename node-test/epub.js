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

async function getChapterURLS(myBook, browser) {
    if (!myBook instanceof Book) {
        console.error("Invalid chapters format in getChapterURLS function.");
        return;
    }
    const chapterImageURLS = [];
    for (let i = 0; i < myBook.chapters.length; i++) {
        const chapter = myBook.chapters[i];
        let chapterImages = await getChapterImages(chapter.link, browser);
        chapterImages = chapterImages.slice(2);
        if (i === 0) {
            chapterImages = chapterImages.slice(0, chapterImages.length - 7);
        }
        chapter.addimages(chapterImages);
        chapterImageURLS.push(chapterImages);
    }

    return chapterImageURLS;
}

async function makeBook(url, browser) {
    const page = await browser.newPage()
    await page.goto(url);



    const title = await page.$eval('h1.text-2xl.font-bold', el => el.textContent.trim());
    console.log(title);

    const author = await page.$eval('a.link.link-info.link-hover', el => el.textContent.trim());
    console.log(author);

    const myBook = new Book(title, author);

    let images = await page.$$('img', img => img.src);
    let cover = await images[2].evaluate(img => img.src);
    console.log(cover);
    myBook.addCover(cover);

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

    const chapterList = chapterObj.map(ch => new Chapter(ch.text, ch.href));
    myBook.addChapters(chapterList);

    return myBook;
}

try {
    (async () => {
        fs.unlink(path.join(__dirname, 'test-epubgen.epub'), (err) => {
            if (err) {
                console.error('Error deleting file:', err);
            } else {
                console.log('File deleted successfully');
            }
        });

        const browser = await puppeteer.launch({ headless: false, slowMo: 50 });

        const myBook = await makeBook('https://weebcentral.com/series/01JQEEGZBEX61ZXYPEJFVTEC4W/mrchen-crown', browser)


        let urls = await getChapterURLS(myBook, browser)
        console.log(urls);

        console.log(myBook);

        await browser.close();

        // Flatten all images with their chapter info
        const allImages = [];
        myBook.chapters.slice().reverse().forEach((chapter, chapterIdx) => {
            const images = urls[myBook.chapters.length - 1 - chapterIdx] || [];
            images.forEach((imgUrl, imgIdx) => {
                allImages.push({
                    title: `${chapter.title} - Page ${imgIdx + 1}`,
                    imgUrl
                });
            });
        });

        const content = allImages.map(imgObj => ({
            title: imgObj.title,
            data:
                `<style>
                body, html { margin:0!important; padding:0!important; width:100vw!important; height:100vh!important; background:#000; }
                </style>
                <img src="${imgObj.imgUrl}" alt="image" style="width:100%;height:100%;display:block;margin:0 auto;max-width:100vw;max-height:100vh;object-fit:contain;"/>`
        }));

        const options = {
            title: myBook.title,
            author: myBook.author,
            cover: myBook.cover,
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



