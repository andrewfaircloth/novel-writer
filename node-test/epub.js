const epub = require("epub-gen");
var fs = require('fs');
const path = require('path');

var book = require("./book.js")

const { Book, Chapter } = require('./book.js')
const myBook = new Book("Nisekoi", "Naoshi Komi");
const chapters = [
    new Chapter("Chapter 1", "https://weebcentral.com/series/01J76XY7F84AQF7DNFA0865TGQ/Nisekoi/1", ["img0.png", "img1.png", "img2.png"]),
    new Chapter("Chapter 2", "https://weebcentral.com/series/01J76XY7F84AQF7DNFA0865TGQ/Nisekoi/2", ["img0.png", "img1.png", "img2.png"]),
];
myBook.addChapters(chapters);
myBook.addCover("google.png");

const title = myBook.title;
const author = myBook.author;
const cover = myBook.cover;

const chapterObj = myBook.chapters;

const content1 = myBook.chapters.map(chapter => {
    return {
        title: chapter.title,
        data: `<h1>${chapter.title}</h1><p>Read <a href="${chapter.link}">here</a></p>` +
            chapter.images.map(img => `<img src="images/${chapter.folder}/${img}" alt="${img}"/>`).join('')
    };
});

const files = myBook.chapters.flatMap(chapter =>
    chapter.images.map(img => `images/${chapter.folder}/${img}`)
);

const options = {
    title,
    author,
    cover,
    content1,
    files
}


const content = [
    {
        title: "Chaptasdawsdaer 1",
        data: `
      <h1>Chapter 1</h1>
      <p>This is the first chapter.</p>
      <img src="images/Chapter_1/img0.png" alt="img0"/>
      <img src="images/Chapter_1/img1.png" alt="img1"/>
      <img src="images/Chapter_1/img2.png" alt="img2"/>
    `
    }
];

const options1 = {
    title: "Sample Book",
    author: "Author Name",
    cover: path.resolve(__dirname, "google.png"),
    content,
    files: [
        path.resolve(__dirname, "images/Chapter_1/img0.png"),
        path.resolve(__dirname, "images/Chapter_1/img1.png"),
        path.resolve(__dirname, "images/Chapter_1/img2.png")

    ]
};

new epub(options1, 'book.epub').promise;

