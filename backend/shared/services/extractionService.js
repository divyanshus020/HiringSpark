import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';
import mammoth from 'mammoth';
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
        const dataBuffer = fs.readFileSync(filePath);
        const data = new Uint8Array(dataBuffer);

        const loadingTask = pdfjsLib.getDocument({
            data,
            useSystemFonts: true,
            disableFontFace: true,
        });
        const pdf = await loadingTask.promise;

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

        return {
            text: fullText.trim() || '',
            links: Array.from(links)
        };
    } catch (error) {
        console.error('Error extracting PDF text:', error);
        return { text: '', links: [] };
    }
}

async function extractDocxText(filePath) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const result = await mammoth.extractRawText({ buffer: dataBuffer });

        // Mammoth doesn't extract links in extractRawText mode easily.
        // We can use transformDocument if needed, but raw text is usually enough for AI.
        return {
            text: result.value || '',
            links: [] // Links are harder to extract from DOCX without complex parsing
        };
    } catch (error) {
        console.error('Error extracting DOCX text:', error);
        return { text: '', links: [] };
    }
}
