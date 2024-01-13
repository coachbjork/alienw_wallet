import { AW } from '$lib/constants';
import { getSingleData } from '$lib/contractKit';
import { json } from '@sveltejs/kit';

export async function GET(req) {
    const activePlanet = req.url.searchParams.get("activePlanet");
    const voter = req.url.searchParams.get("voter");
    // const voter = "hznmm.c.wam";
    if (!activePlanet || !AW.PLANETS.includes(activePlanet)) {
        return json({ status: 400, message: "Invalid planet" });
    }

    const res: any = await getSingleData(AW.CONTRACT_NAME, activePlanet?.toLowerCase(), AW.VOTES_TABLE, voter);
    return json(res);
}