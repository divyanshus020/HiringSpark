import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';
import path from 'path';

export async function extractTextFromFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.pdf') {
        return await extractPdfTextAndLinks(filePath);
    } else if (ext === '.docx') {
        return await extractDocxText(filePath);
    } else if (ext === '.doc') {
        // Basic fallback for old .doc if possible, or just error
        throw new Error('Unsupported file format: .doc. Please use .docx or .pdf');
    } else {
        throw new Error(`Unsupported file format: ${ext}`);
    }
}

async function extractPdfTextAndLinks(filePath) {
    try {
        console.log(`📂 Attempting to extract text from: ${filePath}`);

        if (!fs.existsSync(filePath)) {
            console.error(`❌ File does not exist at path: ${filePath}`);
            return { text: '', links: [] };
        }

        const dataBuffer = fs.readFileSync(filePath);
        console.log(`📄 File read successful, buffer size: ${dataBuffer.length} bytes`);

        const data = new Uint8Array(dataBuffer);

        const loadingTask = pdfjsLib.getDocument({
            data,
            useSystemFonts: true,
            disableFontFace: true,
        });
        const pdf = await loadingTask.promise;
        console.log(`📖 PDF loaded, total pages: ${pdf.numPages}`);

        let fullText = '';
        const links = new Set();

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item) => item.str)
                .join(' ');
            fullText += pageText + ' ';

            const annotations = await page.getAnnotations();
            annotations.forEach((anno) => {
                if (anno.subtype === 'Link' && anno.url) {
                    let cleanUrl = anno.url.trim();
                    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
                        cleanUrl = 'https://' + cleanUrl;
                    }
                    try {
                        new URL(cleanUrl);
                        links.add(cleanUrl);
                    } catch {
                        // Invalid URL
                    }
                }
            });
        }

        const trimmedText = fullText.trim();
        console.log(`✅ Extraction complete. Extracted text length: ${trimmedText.length}`);

        return {
            text: trimmedText || '',
            links: Array.from(links)
        };
    } catch (error) {
        console.error('❌ Error extracting PDF text:', error);
        return { text: '', links: [] };
    }
}

async function extractDocxText(filePath) {
    try {
        const mammoth = await import('mammoth');
        const dataBuffer = fs.readFileSync(filePath);
        const result = await mammoth.default.extractRawText({ buffer: dataBuffer });

        return {
            text: result.value || '',
            links: []
        };
    } catch (error) {
        console.error('Error extracting DOCX text:', error);
        if (error.code === 'ERR_MODULE_NOT_FOUND') {
            throw new Error('Word (.docx) support library (mammoth) is missing. High-level PDF parsing will still work.');
        }
        return { text: '', links: [] };
    }
}
