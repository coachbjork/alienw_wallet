import { PINATA_KEY, PINATA_SECRET_KEY } from '$env/static/private';
import pinataSDK from '@pinata/sdk';
import { json } from '@sveltejs/kit';
import { toNodeReadable } from 'web-streams-node';

const pinata = new pinataSDK(PINATA_KEY, PINATA_SECRET_KEY);

export async function POST({ request }) {
    // get file which's sent via request formData
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
        return json({ error: 'No file uploaded' }, { status: 400 });
    }

    try {
        const webStream = file.stream();
        const nodeStream = toNodeReadable(webStream); // Convert to Node.js stream
        const result = await pinata.pinFileToIPFS(nodeStream, {
            pinataMetadata: {
                name: file.name,
            },
        });
        console.log("pin", result);

        return json({
            ipfsHash: result.IpfsHash,
        }, {
            status: 200,
        });
    } catch (error: any) {
        console.error('Error uploading to Pinata:', error);
        return json({ message: error.message }, { status: 500 });
    }
}