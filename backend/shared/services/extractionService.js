import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';
import path from 'path';

export async function extractTextFromFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    console.log(`[Extractor] 📂 Processing ${ext} file: ${path.basename(filePath)}`);
    try {
        if (ext === '.pdf') {
            return await extractPdfText(filePath);
        } else if (ext === '.docx') {
            return await extractDocxText(filePath);
        } else {
            throw new Error(`Unsupported format: ${ext}`);
        }
    } catch (error) {
        console.error('❌ [Extractor] Error:', error.message);
        return { text: '', links: [] };
    }
}

async function extractPdfText(filePath) {
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
                .join(' '); // Changed ' b' to ' ' for cleaner text
            fullText += pageText + ' ';

            const annotations = await page.getAnnotations();
            annotations.forEach((anno) => {
                if (anno.subtype === 'Link' && anno.url) {
                    let cleanUrl = anno.url.trim();
                    if (!cleanUrl.startsWith('http')) {
                        cleanUrl = 'https://' + cleanUrl;
                    }
                    try {
                        new URL(cleanUrl);
                        links.add(cleanUrl);
                    } catch {
                        // Skip invalid URLs
                    }
                }
            });
        }
        return {
            text: fullText.trim(),
            links: Array.from(links)
        };
    } catch (error) {
        console.error('Error extracting PDF text:', error);
        return { text: '', links: [] };
    }
}

async function extractDocxText(filePath) {
    try {
        const mammoth = await import('mammoth');

        // Extract plain text
        const { value: text } = await mammoth.default.extractRawText({ path: filePath });

        // Extract HTML to find embedded links
        const { value: html } = await mammoth.default.convertToHtml({ path: filePath });

        const links = new Set();
        // Extract links from HTML a tags
        const linkMatches = html.matchAll(/href="([^"]+)"/g);
        for (const match of linkMatches) {
            let url = match[1];
            if (url.startsWith('http')) {
                links.add(url);
            }
        }

        return {
            text: text.trim(),
            links: Array.from(links)
        };
    } catch (error) {
        console.error('Error extracting DOCX text:', error);
        return { text: '', links: [] };
    }
}
