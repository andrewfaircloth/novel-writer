import { NextResponse } from 'next/server';
const puppeteer = require('puppeteer');

export async function POST(title) {
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage()
        await page.goto('https://weebcentral.com/search')


        await (await page.$$('input[name="text"]', 'type=search'))[1].click();
        await page.keyboard.type(string(title));

        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
            page.keyboard.press('Enter'),
        ]);


        const results = await page.$$('a.line-clamp-1.link.link-hover');
        const images = await page.$$('source');

        let arr = [];

        console.log('Found ' + results.length + ' results');
        for (let i = 0; i < results.length; i++) {
            const title = await results[i].evaluate(el => el.innerText);
            console.log('Result ' + i + ': ' + title);
            const link = await results[i].evaluate(el => el.href);
            console.log('Link ' + i + ': ' + link);
            const image = await images[i].evaluate(e1 => e1.srcset);
            console.log('Image ' + i + ': ' + image);
            console.log('');
            arr[i] = { title: title, link: link, image: image };
        }
        await browser.close();
        return NextResponse.json(arr);
    } catch (err) {
        await browser.close();
        console.error(err);
        return NextResponse.json({});
    }
}


export async function GET(req) {
    const { search, mangaUrl, limit } = await req.json();

    const browser = await puppeteer.launch();
    const page = await browser.newPage();


    // Go to the manga page and get chapters/pages
    await page.goto(mangaUrl, { waitUntil: 'networkidle2' });
    // Get chapter links (adjust selector for WeebCentral)
    const chapters = await page.$$eval('.chapters-list a', links =>
        links.map(link => ({
            title: link.textContent.trim(),
            url: link.href
        }))
    );
    // Limit chapters if requested
    const limitedChapters = chapters.slice(0, limit || chapters.length);
    const imagesByChapter = [];
    for (const chapter of limitedChapters) {
        await page.goto(chapter.url, { waitUntil: 'networkidle2' });
        // Get all image URLs in the chapter (adjust selector for WeebCentral)
        const images = await page.$$eval('.reader-area img', imgs => imgs.map(img => img.src));
        imagesByChapter.push({ chapter: chapter.title, images });
    }
    await browser.close();
    return NextResponse.json({ imagesByChapter });


    await browser.close();
    return NextResponse.json({ error: 'No search or mangaUrl provided.' }, { status: 400 });
}
