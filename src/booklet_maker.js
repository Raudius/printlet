import {PageSizes, PDFDocument, degrees} from "pdf-lib";
import {Orientation} from "@/printlet";

class Vec2D {
    constructor(x=0, y=0) {
        this.x = x;
        this.y = y;
    }

    transpose () {
        [this.x, this.y] = [this.y, this.x]
    }
}

/**
 * @param pdf_file
 * @param booklet_options
 * @returns {boolean}
 */
export async function createBooklet(pdf_file, booklet_options) {
    const booklet_page_size = PageSizes[booklet_options.page_size];
    const booklet_page_count = calculateBookletPageCount(pdf_file, booklet_options);
    const page_grid = calculatePageGrid(pdf_file, booklet_options);
    const booklet_doc = await PDFDocument.create();

    const pages = [];
    for (let i=0; i<booklet_page_count; i++) {
        pages[i] = booklet_doc.addPage(booklet_page_size);
        if (booklet_options.rotate_even_pages && i % 2 ===1) {
            pages[i].setRotation(degrees(180))
        }
    }

    const rotate_page = isPageRotated(pdf_file, booklet_options);
    const render_left_to_right = !rotate_page;
    const grid_position = new Vec2D(); // (x = 0) = render_left_to_right ? left : right ; (y = 0) = bottom

    const page_dimensions = new Vec2D(booklet_page_size[0] / page_grid.x, booklet_page_size[1] / page_grid.y)

    const pdf = await PDFDocument.load(await pdf_file.document.save());
    for (let i=0; i<pdf.getPageCount(); i++) {
        const booklet_page_index = calculateBookletPageForPdfPage(i, booklet_page_count, page_grid);
        const booklet_page = pages[booklet_page_index];

        const page = pdf.getPages()[i];
        const embedded_page = await booklet_doc.embedPage(
            page,
            null,
            rotate_page ? [0, -1, 1, 0, 0, page.getWidth()] : null
        );

        rotate_page && page_dimensions.transpose();
        const scale_factor = Math.min(page_dimensions.x / page.getWidth(), page_dimensions.y / page.getHeight());
        rotate_page && page_dimensions.transpose();

        booklet_page.drawPage(embedded_page, {
            x: (render_left_to_right ? grid_position.x : page_grid.x - grid_position.x - 1) * page_dimensions.x,
            y: grid_position.y * page_dimensions.y,
            xScale: scale_factor,
            yScale: scale_factor
        });

        advanceGridPosition(grid_position, page_grid);
    }

    return await booklet_doc.save();
}

/**
 * Advance the current position along the grid.
 * @param grid_position
 * @param grid
 */
function advanceGridPosition(grid_position, grid) {
    if (++grid_position.x >= grid.x) {
        grid_position.x = 0;
        if (++grid_position.y >= grid.y) {
            grid_position.y = 0;
        }
    }
}

/**
 * Calculates the page of the output PDF on which a given page of the input PDF belongs.
 * This is calculated by first determining the "index" of the input page. This index groups consecutive pages that will
 * appear side by side on the output PDF. These can then be treated as a page on a PDF where consecutive pages are not
 * shown side by side.
 *
 * @param {number} pdf_page
 * @param {number} booklet_page_count
 * @param {Vec2D} page_grid
 * @returns {number}
 */
function calculateBookletPageForPdfPage(pdf_page, booklet_page_count, page_grid) {
    const index = Math.floor(pdf_page / ((page_grid.x*page_grid.y) / 2));
    return Math.abs((index % booklet_page_count) - ((booklet_page_count-1) * Math.floor(index/booklet_page_count)));
}

/**
 * The output pdf is always generated in portrait, which would show the fold along the middle horizontally.
 * So we only need to rotate the pages if the fold is vertical.
 * @param pdf_file
 * @param booklet_options
 * @returns {boolean}
 */
function isPageRotated(pdf_file, booklet_options) {
    return booklet_options.getFoldOrientation() === Orientation.VERTICAL;
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
    return pdf_file.getOrientation() === booklet_options.getFoldOrientation()
        ? new Vec2D(1,2) : new Vec2D(2,2);
}
