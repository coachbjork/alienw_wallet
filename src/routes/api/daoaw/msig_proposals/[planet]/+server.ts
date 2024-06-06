import { ALIEN_WALLET_API } from '$env/static/private';
import { json } from '@sveltejs/kit';
import axios from 'axios';
export const prerender = true;

/** @type {import('./$types').EntryGenerator} */
export interface RouteParams {
    planet: string;
}

export function entries() {
    return [
        { planet: 'kavian' } as RouteParams // Add 'planet' property with an empty string value
    ];
}

export async function GET({ params, request, cookies }) {
    const { planet } = params;
    const response = await axios.get(`${ALIEN_WALLET_API}/proposals/${planet}`);
    if (response?.data) {
        let { data } = response;
        data = data.map((item: any) => {

            // trx_contracts: {
            // 	'0': {
            // 		'dao.worlds': 'claimbudget'
            // 	}
            // },
            // trx_actions: {
            // 	'0': {
            // 		dac_id: 'kavian'
            // 	}
            // },
            // convert trx_contracts and trx_actions to an array of objects with contract_name, action_name and action_data
            item.actions = Object.keys(item.trx_contracts).map((key: any) => {

                return {
                    contract_name: Object.entries(item.trx_contracts[key])[0][0],
                    action_name: Object.entries(item.trx_contracts[key])[0][1],
                    action_data: item.trx_actions[key]
                }
            });

            return item;
        });
        console.log("herer");
        return json(data);
    } else {
        return json([]);
    }
}