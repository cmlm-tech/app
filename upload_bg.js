import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Manual .env parser to avoid checking for missing dotenv package
function loadEnv() {
    try {
        const envPath = resolve(__dirname, '.env');
        if (!existsSync(envPath)) return {};
        const content = readFileSync(envPath, 'utf-8');
        const env = {};
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                let value = match[2].trim();
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                env[match[1].trim()] = value;
            }
        });
        return env;
    } catch (e) {
        console.warn('Could not read .env file', e);
        return {};
    }
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Image details
// Converting Windows path to WSL compatible path manually if needed, 
// but since we are running in WSL context, we should use the /mnt/c path.
const localImagePath = '/mnt/c/Users/carlos_lira/.gemini/antigravity/brain/9e0bc6e0-d031-4b66-ae42-2140cb308bfc/uploaded_image_1765614121766.jpg';
const bucketName = 'assets';
const fileName = 'background_home_final.jpg';

async function uploadImage() {
    try {
        console.log(`Reading image from: ${localImagePath}`);
        const fileContent = readFileSync(localImagePath);

        console.log(`Uploading to bucket '${bucketName}' as '${fileName}'...`);
        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(fileName, fileContent, {
                contentType: 'image/jpeg',
                upsert: true
            });

        if (error) {
            throw error;
        }

        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName);

        console.log('Upload successful!');
        console.log(`Public URL: ${publicUrl}`);
    } catch (err) {
        console.error('Error uploading image:', err);
        process.exit(1);
    }
}

uploadImage();
