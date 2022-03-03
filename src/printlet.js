import {calculatePdfPagesPerBookletPage} from "@/booklet_maker";
import Cookies from 'js-cookie'

const DefaultCookieOptions = {
    expires: 5000,
    sameSite: 'strict'
}

export const Orientation = {
    UNKNOWN: -1,
    PORTRAIT: 0,
    LANDSCAPE: 1,
    VERTICAL: 0,
    HORIZONTAL: 1
};

export const OutputFormats = {
    PDF: 0,
    ZIP: 1
}

export const TextDirection = {
    L2R: 0,
    R2L: 1
}

/**
 * Represents an uploaded PdfFile.
 */
export class PdfFile {
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

    getBaseName() {
        return this.file_name.replaceAll('.pdf', '');
    }
}

/**
 * Loads the booklet options from the cookie store.
 * @returns {BookletOptions}
 */
export function loadBookletOptions() {
    const booklet_options = new BookletOptions();

    for (const key in booklet_options) {
        const type = booklet_options[key]?.constructor;
        const value = Cookies.get(key);
        const casted_value = type ? (type) (value) : null;
        if (value && casted_value !== null) {
            booklet_options[key] = casted_value;
            console.log(key + " -> " + casted_value)
        }
    }

    return booklet_options;
}

/**
 * Collects all the options that define how the booklet should be created.
 */
export class BookletOptions {
    constructor() {
        this.text_read_direction = TextDirection.L2R;
        this.pages_per_page = 1;
        this.rotate_even_pages = false;
        this.page_size = "A4";
        this.multiple_booklets = false;
        this.booklet_size = 6;
        this.output_format = OutputFormats.ZIP;
    }

    /**
     * Saves the booklet options to the cookie store.
     */
    save () {
        for (const key in this) {
            Cookies.set(key, this[key], DefaultCookieOptions);
        }
    }

    /**
     * Returns the output format. If multiple-booklets is disabled we default to PDF output.
     *
     * @returns {number}
     */
    getOutputFormat () {
        return this.multiple_booklets ? this.output_format : OutputFormats.PDF;
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

    /**
     * @param {PdfFile} pdf_file
     * @returns {PageProvider[]}
     */
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
 * Utility class which provides a convinient way to iterate through subsets of input PDF pages.
 */
class PageProvider {
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

/**
 * Detects the orientation of a PDF document.
 * @param {PDFDocument} pdf_document
 * @returns {number}
 */
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

/**
 * Detects the Orientation of a single page.
 * @param {PDFPage} page
 * @returns {number}
 */
function detectPageOrientation (page) {
    const {width, height} = page.getSize()
    const rotated = (page.getRotation().angle / 90) % 2 !== 0;
    const landscape = width > height;

    return (landscape && !rotated) || (!landscape && rotated)
        ? Orientation.LANDSCAPE
        : Orientation.PORTRAIT;
}