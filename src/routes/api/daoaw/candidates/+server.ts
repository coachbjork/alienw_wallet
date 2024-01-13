import { AW } from '$lib/constants';
import { cursorAll, getMultiDataCursor } from '$lib/contractKit';
import { json } from '@sveltejs/kit';
import axios from "axios";

export async function GET(req) {
    const activePlanet = req.url.searchParams.get("activePlanet");
    if (!activePlanet || !AW.PLANETS.includes(activePlanet)) {
        return json({ status: 400, message: "Invalid planet" });
    }

    const cursor: any = await getMultiDataCursor(AW.CONTRACT_NAME, activePlanet?.toLowerCase(), AW.CANDIDATES_TABLE);
    const data: any = await cursorAll(cursor);

    const custodians_data = await axios.get(`https://alienw.com/api/v0/candidates/${activePlanet?.toLowerCase()}`);

    const serializedCandidates = data.filter((item: any) => { return parseInt(item.is_active.value) === 1 }).map((item: any) => {
        return {
            candidate_name: String(item.candidate_name),
            requestedpay: String(item.requestedpay),
            rank: parseInt(item.rank),
            gap_filler: parseInt(item.gap_filler),
            total_vote_power: parseInt(item.total_vote_power) / 10000,
            is_active: parseInt(item.is_active),
            number_voters: parseInt(item.number_voters),
            avg_vote_time_stamp: `${String(item.avg_vote_time_stamp)}Z`,
            running_weight_time: parseInt(item.running_weight_time),
            description: custodians_data.data[String(item.candidate_name)]?.description || "",
            image: custodians_data.data[String(item.candidate_name)]?.image || "",
            name: custodians_data.data[String(item.candidate_name)]?.name || String(item.candidate_name),
        }
    }).sort((a: any, b: any) => {
        return b.rank - a.rank;
    });

    return json(serializedCandidates);

}