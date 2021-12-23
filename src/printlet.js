import {PDFDocument} from "pdf-lib";

export const Orientation = {
    UNKNOWN: -1,
    PORTRAIT: 0,
    LANDSCAPE: 1
};

/**
 * @param {File} file
 * @returns {Promise<PdfFile>}
 */
export async function loadPdfFile(file)
{
    return await fileToBase64(file).then(async pdf_content => {
        const document = await PDFDocument.load(pdf_content);
        return new PdfFile(file.name, document);
    });
}

class PdfFile {
    /**
     * @param {String} file_name
     * @param {PDFDocument} document
     */
    constructor (file_name, document) {
        this.file_name = file_name;
        this.document = document;
        this.orientation = detectPdfOrientation(document);
    }
}

export class BookletOptions {
    constructor(page_turn_direction, booklet_orientation, rotate_even_pages) {
        this.page_turn_direction = page_turn_direction;
        this.booklet_orientation = booklet_orientation;
        this.rotate_even_pages = rotate_even_pages;
    }
}

function detectPdfOrientation (pdf_document) {
    const pages = pdf_document.getPages();

    let orientation = detectPageOrientation(pages[0]);
    for (let i=0; i<pages.length; i++) {
        const page = pages[i];
        const page_orientation = detectPageOrientation(page)

        if (orientation !== page_orientation) {
            return Orientation.UNKNOWN;
        }
    }
    return orientation;
}

function detectPageOrientation (page) {
    const {width, height} = page.getSize()
    const rotated = (page.getRotation().angle / 90) % 2 !== 0;
    const landscape = width > height;

    return (landscape && !rotated) || (!landscape && rotated)
        ? Orientation.LANDSCAPE
        : Orientation.PORTRAIT;
}

/**
 * @param {File} file
 * @returns {Promise<String>}
 */
const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});


