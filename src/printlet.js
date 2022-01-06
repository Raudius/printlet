import {PDFDocument} from "pdf-lib";
import {calculatePdfPagesPerBookletPage} from "@/booklet_maker";
import * as JSZip from 'jszip';
import Cookies from 'js-cookie'

export const Orientation = {
    UNKNOWN: -1,
    PORTRAIT: 0,
    LANDSCAPE: 1,
    VERTICAL: 0,
    HORIZONTAL: 1
};

export const TextDirection = {
    L2R: 0,
    R2L: 1
}

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

export class PageProvider {
    current = 0;
    start = 0;
    end = 0;
    step = 1;

    constructor(start, end) {
        this.start = start;
        this.current = start;
        this.end = end;
    }

    range () {
        return this.end - this.start;
    }
    next () {
        this.current += this.step;
        return (this.end - this.current > 0) ? this.current : -1;
    }
    reset () {
        this.current = this.start
        return this.current;
    }
}

export function loadBookletOptions() {
    const booklet_options = new BookletOptions();

    for (const key in booklet_options) {
        const type = booklet_options[key]?.constructor;
        const value = Cookies.get(key);
        const casted_value = type ? (type) (value) : null;
        if (value && casted_value) {
            booklet_options[key] = casted_value;
        }
    }

    return booklet_options;
}

export class BookletOptions {
    constructor() {
        this.text_read_direction = TextDirection.L2R;
        this.pages_per_page = 1;
        this.rotate_even_pages = false;
        this.page_size = "A4";
        this.multiple_booklets = false;
        this.booklet_size = 6;
    }

    save () {
        for (const key in this) {
            Cookies.set(key, this[key], { sameSite: 'strict' });
        }
    }

    /**
     * Returns the fold orientation given a vertical page.
     * @returns {number}
     */
    getFoldOrientation (pdf_file) {
        const pdf_orientation = pdf_file.getOrientation();
        const pdf_orientation_opposite = pdf_orientation === Orientation.PORTRAIT ? Orientation.LANDSCAPE : Orientation.PORTRAIT;

        return this.pages_per_page % 2 === 0
            ? pdf_orientation_opposite
            : pdf_orientation;
    }

    getPageProviders(pdf_file) {
        const page_providers = [];
        const p_max = pdf_file.document.getPageCount();
        const booklet_size = this.multiple_booklets ? this.booklet_size : p_max;
        const p_step = calculatePdfPagesPerBookletPage(pdf_file, this) * booklet_size * 2;

        let p = 0;
        while (p < p_max) {
            const page_provider = new PageProvider();

            page_provider.start = p;
            p += p_step;
            page_provider.end = Math.min(p, p_max);
            page_providers.push(page_provider);
        }

        return page_providers;
    }
}

/**
 * @param {String} base_name
 * @param {Uint8Array[]} files
 * @returns {Promise<Uint8Array>}
 */
export async function createZip (base_name, files) {
    let zip = new JSZip();

    files.forEach((file, index) => {
        const name = base_name + "_" + (index+1) + ".pdf";
        zip.file(name, file)
    });

    return zip.generateAsync({type:"uint8array"});
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


