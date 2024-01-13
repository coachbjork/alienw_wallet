import { AW } from '$lib/constants';
import { getSingleData } from '$lib/contractKit';
import { json } from '@sveltejs/kit';

export async function GET(req) {
    const activePlanet = req.url.searchParams.get("activePlanet");
    if (!activePlanet || !AW.PLANETS.includes(activePlanet)) {
        return json({ status: 400, message: "Invalid planet" });
    }
    const data: any = await getSingleData(AW.CONTRACT_NAME, activePlanet?.toLowerCase(), AW.DACGLOBALS_TABLE);
    return json(data.data);
}