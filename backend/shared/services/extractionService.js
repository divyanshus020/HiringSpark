import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';
import path from 'path';

export async function extractTextFromFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    try {
        if (ext === '.pdf') {
            return await extractPdfText(filePath);
        } else if (ext === '.docx') {
            return await extractDocxText(filePath);
        } else {
            throw new Error(`Unsupported format: ${ext}`);
        }
    } catch (error) {
        console.error('❌ Extraction Error:', error);
        return { text: '', links: [] };
    }
}

async function extractPdfText(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = new Uint8Array(dataBuffer);
    const pdf = await pdfjsLib.getDocument({ data, useSystemFonts: true }).promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(s => s.str).join(' ') + '\n';
    }
    return { text: fullText.trim(), links: [] };
}

async function extractDocxText(filePath) {
    const mammoth = await import('mammoth');
    const result = await mammoth.default.extractRawText({ path: filePath });
    return { text: result.value, links: [] };
}
