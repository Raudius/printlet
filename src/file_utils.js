import {PDFDocument} from "pdf-lib";
import * as JSZip from "jszip";
import {PdfFile} from "@/printlet";

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