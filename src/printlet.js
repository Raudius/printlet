import {PDFDocument} from "pdf-lib";

export const Orientation = {
    UNKNOWN: -1,
    PORTRAIT: 0,
    LANDSCAPE: 1,
    VERTICAL: 0,
    HORIZONTAL: 1
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
    orientation_manual = Orientation.UNKNOWN;

    /**
     * @param {String} file_name
     * @param {PDFDocument} document
     */
    constructor (file_name, document) {
        this.file_name = file_name;
        this.document = document;
        this.orientation = detectPdfOrientation(document);
    }

    getOrientation () {
        return (this.orientation !== Orientation.UNKNOWN) ? this.orientation : this.orientation_manual;
    }
}

export class BookletOptions {
    constructor() {
        this.text_read_direction = 0;
        this.pages_per_page = 1;
        this.rotate_even_pages = false;
        this.page_size = "A4"
    }

    /**
     * Returns the fold orientation given a vertical page.
     * @returns {number}
     */
    getFoldOrientation () {
        return this.pages_per_page % 2 === 0
            ? Orientation.HORIZONTAL
            : Orientation.VERTICAL;
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


