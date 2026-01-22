import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

// Combined function to extract both text and links from PDF using pdfjs-dist
export async function extractPdfTextAndLinks(filePath) {
    try {
        // Read file as buffer
        const dataBuffer = fs.readFileSync(filePath);
        const data = new Uint8Array(dataBuffer);

        // Load PDF document
        const loadingTask = pdfjsLib.getDocument({
            data,
            useSystemFonts: true,
            disableFontFace: true,
        });
        const pdf = await loadingTask.promise;

        let fullText = '';
        const links = new Set();

        // Process each page
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);

            // Extract text content
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item) => item.str)
                .join(' b');
            fullText += pageText + ' ';

            // Extract annotations (contains embedded links)
            const annotations = await page.getAnnotations();
            annotations.forEach((anno) => {
                if (anno.subtype === 'Link' && anno.url) {
                    let cleanUrl = anno.url.trim();
                    // Add https:// if missing
                    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
                        cleanUrl = 'https://' + cleanUrl;
                    }
                    // Validate URL
                    try {
                        new URL(cleanUrl);
                        links.add(cleanUrl);
                    } catch {
                        // Invalid URL, skip
                    }
                }
            });
        }

        return {
            text: fullText.trim() || '',
            links: Array.from(links)
        };
    } catch (error) {
        console.error('Error extracting PDF text and links:', error);
        // Return empty values instead of throwing to allow processing to continue
        return { text: '', links: [] };
    }
}
