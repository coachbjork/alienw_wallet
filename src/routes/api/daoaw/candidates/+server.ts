import { json } from '@sveltejs/kit';
import axios from "axios";
export const prerender = true;

export async function GET({ params }: { params: any }) {
    const activePlanetScope = params.activePlanetScope;
    const custodians_data = await axios.get(`https://alienw.com/api/v0/candidates/${activePlanetScope}`);
    return json(custodians_data.data);
}