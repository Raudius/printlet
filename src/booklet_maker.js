import {PageSizes, PDFDocument} from "pdf-lib";
import {Orientation} from "@/printlet";

class Vec2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    transpose() {
        [this.x, this.y] = [this.y, this.x]
    }
}

/**
 * @param pdf_file
 * @param booklet_options
 * @returns {boolean}
 */
export async function createBooklet(pdf_file, booklet_options) {
    const booklet_page_size = PageSizes.A4;
    const booklet_page_count = calculateBookletPageCount(pdf_file, booklet_options);

    const booklet_doc = await PDFDocument.create();

    const pages = [];
    for (let i=0; i<booklet_page_count; i++) {
        pages[i] = booklet_doc.addPage(booklet_page_size);
    }

    let page_align_top = false;
    const rotate_page = isPageRotated(pdf_file, booklet_options);

    // Reload pdf (needed for embedding pages) - pdf-lib bug?
    const pdf = await PDFDocument.load(await pdf_file.document.save());
    for (let i=0; i<pdf.getPageCount(); i++) {
        const booklet_page_index = calculateBookletPageForPdfPage(i, booklet_page_count);
        const booklet_page = pages[booklet_page_index];

        const page = pdf.getPages()[i];
        const embedded_page = await booklet_doc.embedPage(
            page,
            null,
            rotate_page ? [0, -1, 1, 0, 0, page.getWidth()] : null
        );

        const page_dimens = new Vec2D(booklet_page.getWidth(), booklet_page.getHeight()/2);
        const page_translation = new Vec2D( 0, page_align_top ? booklet_page.getHeight()/2 : 0);
        rotate_page && page_dimens.transpose();

        booklet_page.drawPage(embedded_page, {
            height: page_dimens.y,
            width: page_dimens.x,
            x: page_translation.x,
            y: page_translation.y
        });

        page_align_top = !page_align_top;
    }

    return await booklet_doc.save();
}

/**
 * @param {number} pdf_page
 * @param {number} booklet_page_count
 * @returns {number}
 */
function calculateBookletPageForPdfPage(pdf_page, booklet_page_count) {
    return Math.abs((pdf_page % booklet_page_count) - ((booklet_page_count-1) * Math.floor(pdf_page/booklet_page_count)));
}

/**
 * The output pdf is always generated in portrait, which would show the fold along the middle horizontally.
 * So we only need to rotate the pages if the fold is vertical.
 * @param pdf_file
 * @param booklet_options
 * @returns {boolean}
 */
function isPageRotated(pdf_file, booklet_options) {
    return booklet_options.orientation === Orientation.PORTRAIT;
}

/**
 * Determines the amount of pages in the resulting booklet PDF.
 * Note that to create the booklet we may need to include some intentionally blank pages at the end of the booklet.
 * The blank pages are accounted for by basing this calculation on the amount of paper needed to print the booklet.
 *
 * @param {PdfFile} pdf_file
 * @param {BookletOptions} booklet_options
 * @returns {number}
 */
export function calculateBookletPageCount(pdf_file, booklet_options) {
    const pdf_page_count = pdf_file.document.getPageCount();
    const pages_per_booklet_paper = calculatePdfPagesPerBookletPage(pdf_file, booklet_options) * 2;

    return Math.ceil(pdf_page_count / pages_per_booklet_paper) * 2
}

/**
 * @param {PdfFile} pdf_file
 * @param {BookletOptions} booklet_options
 * @returns {number}
 */
export function calculatePdfPagesPerBookletPage(pdf_file, booklet_options) {
    const grid = calculatePageGrid(pdf_file, booklet_options);
    return grid.x * grid.y;
}


/**
 * Determines whether the booklet will contain two PDF pages on each booklet page. This can happen if (for example) we
 * make a horizontal booklet for a PDF with vertical pages: we fill fit two PDF pages side-by-side on each page of the
 * booklet.
 *
 * @param {PdfFile} pdf_file
 * @param {BookletOptions} booklet_options
 * @returns {Vec2D}
 */
function calculatePageGrid(pdf_file, booklet_options) {
    const grid = pdf_file.getOrientation() === booklet_options.orientation
        ? new Vec2D(2,1)
        : new Vec2D(2,2);

    booklet_options.orientation === Orientation.LANDSCAPE && grid.transpose();

    return grid;
}
