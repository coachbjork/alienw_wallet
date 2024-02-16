import { PINATA_KEY, PINATA_SECRET_KEY } from '$env/static/private';
import pinataSDK from '@pinata/sdk';
import { json } from '@sveltejs/kit';

const pinata = new pinataSDK(PINATA_KEY, PINATA_SECRET_KEY);

export async function POST({ request }) {
    const { content_hash } = await request.json();
    if (!content_hash) return json({ error: 'No content hash provided' }, { status: 400 });

    try {
        const result = await pinata.unpin(content_hash);
        console.log("unpin", result);
        return json({
            message: 'Unpinned successfully',
        }, {
            status: 200,
        });
    } catch (error: any) {
        console.error('Error unpining from Pinata:', error);
        return json({ message: error.message }, { status: 500 });
    }
}