class Chapter {
    constructor(title, link, images = []) {
        this.title = title.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '_');
        this.link = link;
        this.folder = `node-test/images/${title.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '_')}`;
        this.imagePaths = images;
    }

    addimage(imageName) {
        this.imagePaths.push(`${this.folder}/${imageName}`);
    }

    print() {
        console.log(`Chapter: ${this.title}\n${this.link}\n`);
    }
}

class Book {
    constructor(title, author) {
        this.title = title;
        this.author = author;
        this.chapters = [];
        this.cover = null;
    }

    addChapters(ChapterList) {
        ChapterList.forEach(chapter => {
            if (chapter instanceof Chapter) {
                this.chapters.push(chapter);
            } else {
                console.error("Invalid chapter format");
            }
        });
    }

    addCover(coverUrl) {
        this.cover = coverUrl;
        console.log(`Cover added: ${coverUrl}`);
    }

    display() {
        console.log(`Book: ${this.title} by ${this.author}`);
        for (const chapter of this.chapters) {
            chapter.print();
        }
    }
}

export { Book, Chapter };