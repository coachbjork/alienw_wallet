import { AW_PLANETS } from '$lib/constants';
import { json } from '@sveltejs/kit';
import axios from "axios";
import _ from "lodash";

export async function GET(req) {
    const activePlanetStore = req.url.searchParams.get("activePlanetStore");
    const planetScope = _.find(AW_PLANETS, (planet: any) => { return planet.name === activePlanetStore })?.scope || "";
    const custodians_data = await axios.get(`https://alienw.com/api/v0/candidates/${planetScope}`);
    return json(custodians_data.data);

}