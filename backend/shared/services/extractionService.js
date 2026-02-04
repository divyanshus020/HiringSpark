import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execFilePromise = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PYTHON_SCRIPT = path.join(__dirname, '../scripts/resume_parser.py');

export async function extractTextFromFile(filePath) {
    try {
        console.log(`🐍 Triggering Python Parser for: ${filePath}`);

        if (!fs.existsSync(filePath)) {
            throw new Error('File not found at path');
        }

        // Try 'python3' first as it's standard on Linux, fallback to 'python'
        let pythonCmd = 'python3';
        try {
            await execFilePromise('python3', ['--version']);
        } catch (e) {
            pythonCmd = 'python';
        }

        // Call python script
        const { stdout, stderr } = await execFilePromise(pythonCmd, [PYTHON_SCRIPT, filePath]);

        if (stderr && !stdout) {
            console.error('Python Error:', stderr);
            throw new Error(`Python extraction failed: ${stderr}`);
        }

        const result = JSON.parse(stdout);

        if (result.error) {
            throw new Error(result.error);
        }

        // Combine links from PDF objects and regex in text
        const extraLinks = result.text.match(/https?:\/\/[^\s<>"]+/g) || [];
        const allLinks = Array.from(new Set([...(result.links || []), ...extraLinks]));

        console.log(`✅ Python parsing complete. Length: ${result.text.length} chars. Links: ${allLinks.length}`);

        return {
            text: result.text || '',
            links: allLinks,
            emails: result.emails || [],
            phones: result.phones || []
        };

    } catch (error) {
        console.error('❌ Extraction Service Error:', error);
        // Fallback to minimal JS if python fails (empty result)
        return { text: '', links: [] };
    }
}
