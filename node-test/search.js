/**
 * @name Amazon search
 *
 * @desc Looks for a "nyan cat pullover" on amazon.com, goes two page two clicks the third one.
 */


const puppeteer = require('puppeteer')

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}


try {
    (async () => {
        const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
        const page = await browser.newPage()
        await page.goto('https://weebcentral.com/search')


        await (await page.$$('input[name="text"]', 'type=search'))[1].click();
        await page.keyboard.type('fairy tail');

        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
            page.keyboard.press('Enter'),
        ]);


        const results = await page.$$('a.line-clamp-1.link.link-hover');
        const images = await page.$$('source');


        console.log('Found ' + results.length + ' results');
        for (let i = 0; i < results.length; i++) {
            const title = await results[i].evaluate(el => el.innerText);
            console.log('Result ' + i + ': ' + title);
            const link = await results[i].evaluate(el => el.href);
            console.log('Link ' + i + ': ' + link);
            const image = await images[i].evaluate(e1 => e1.srcset);
            console.log('Image ' + i + ': ' + image);
            console.log('');
        }
        await browser.close();
    })()
} catch (err) {
    console.error(err)
}