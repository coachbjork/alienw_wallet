import { AW } from '$lib/constants';
import { json } from '@sveltejs/kit';
import axios from "axios";
import _ from "lodash";

export async function GET(req) {
    const activePlanet = req.url.searchParams.get("activePlanet");
    const planetScope = _.find(AW.PLANETS, (planet: any) => { return planet.name === activePlanet })?.scope || "";
    const custodians_data = await axios.get(`https://alienw.com/api/v0/candidates/${planetScope}`);
    return json(custodians_data.data);

}