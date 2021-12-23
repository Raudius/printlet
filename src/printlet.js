import {PDFDocument} from "pdf-lib";

export const ORIENTATION_PORTRAIT = 0;
export const ORIENTATION_LANDSCAPE = 1;

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
    constructor(file_name, document) {
        this.file_name = file_name;
        this.document = document;
        this.orientation = detectPdfOrientation(document);
    }
}

function detectPdfOrientation (pdf_document) {
    const pages = pdf_document.getPages();

    let orientation = detectPageOrientation(pages[0]);
    for (let i=0; i<pages.length; i++) {
        const page = pages[i];
        const page_orientation = detectPageOrientation(page)

        if (orientation !== page_orientation) {
            return -1; // undefined page orientation.
        }
    }
    return orientation;
}

function detectPageOrientation (page) {
    const {width, height} = page.getSize()
    const rotated = (page.getRotation().angle / 90) % 2 !== 0;
    const landscape = width > height;

    return (landscape && !rotated) || (!landscape && rotated)
        ? ORIENTATION_LANDSCAPE
        : ORIENTATION_PORTRAIT;
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


