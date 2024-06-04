import { AW, AW_PLANETS, AW_TOKEN } from '$lib/constants';
import { retryAsync } from '$lib/utils';
import { cursorAll, getMultiDataCursor, getSingleData } from '$lib/utils/wharfkit/contractKit';
import { Asset } from '@wharfkit/antelope';
import _ from "lodash";

export async function get_balances(account: string) {
    const planet_token_cursor: any = await getMultiDataCursor(AW_TOKEN.CONTRACT_NAME, account, AW_TOKEN.TABLES.ACCOUNTS);
    const aw_token_cursor: any = await getMultiDataCursor(AW.CONTRACT_NAME, account, AW.TABLES.ACCOUNTS);
    const planet_token_data_promise = retryAsync(() => cursorAll(planet_token_cursor));
    const aw_token_data_promise = retryAsync(() => cursorAll(aw_token_cursor));

    return Promise.all([planet_token_data_promise, aw_token_data_promise]).then(async ([planet_token_data, aw_token_data]: any) => {
        const tlm_balance = aw_token_data.length > 0 ? aw_token_data[0].balance : Asset.fromUnits(0, '4,TLM');
        const stakes_params: any = {
            index_position: '1',
            key_type: 'i64',
            from: account,
            to: account,
        }
        const staking_planets = AW_PLANETS.filter((planet: any) => {
            return _.find(planet_token_data, (item: any) => {
                return (item.balance.symbol.name === planet.token_symbol && item.balance.value > 0)
            }) !== undefined && planet.token_symbol !== 'TESTA';
        });
        const stakes_data: any = await Promise.all(staking_planets.map(async (planet: any) => {
            const planetScope = planet.scope;
            const stakes_cursor: any = retryAsync(() => getSingleData(AW_TOKEN.CONTRACT_NAME, planetScope, AW_TOKEN.TABLES.STAKES, account, stakes_params));
            return stakes_cursor;
        }));

        const unstakes_params: any = {
            index_position: '2',
            key_type: 'i64',
            from: account,
            to: account,
        }
        let unstakes_data: any = await Promise.all(staking_planets.map(async (planet: any) => {
            const planetScope = planet.scope;
            const unstakes_cursor: any = await getMultiDataCursor(AW_TOKEN.CONTRACT_NAME, planetScope, AW_TOKEN.TABLES.UNSTAKES, unstakes_params);
            return retryAsync(() => cursorAll(unstakes_cursor));
        }));
        // clear empty arrays
        unstakes_data = unstakes_data.filter((item: any) => { return item.length > 0 });

        const balances: any = AW_PLANETS.filter((planet: any) => {
            return planet.token_symbol !== 'TESTA';
        }).map((planet: any) => {
            const balance = _.find(planet_token_data, (item: any) => {
                return item.balance.symbol.name === planet.token_symbol
            })?.balance || Asset.fromUnits(0, `4,${planet.token_symbol}`);
            if (balance.value === 0) {
                return {
                    planet_name: planet.planet_name,
                    dac_id: planet.scope,
                    balance,
                    staked: Asset.fromUnits(0, `4,${planet.token_symbol}`),
                    unstaking: [],
                    total_unstaking: Asset.fromUnits(0, `4,${planet.token_symbol}`),
                    refund: [],
                    total_refund: Asset.fromUnits(0, `4,${planet.token_symbol}`),
                    liquid: Asset.fromUnits(0, `4,${planet.token_symbol}`)
                }
            }
            const staked = _.find(stakes_data, (item: any) => {
                return item.stake.symbol.name === balance.symbol.name
            });
            const unstaking: any = [];
            const refund: any = [];
            const unstake_data = _.find(unstakes_data, (unstake_item: any) => {
                return _.find(unstake_item, (item: any) => {
                    return item.stake.symbol.name === balance.symbol.name
                });
            });
            if (unstake_data) {
                unstake_data.forEach((unstake_item: any) => {

                    if (parseInt(unstake_item.release_time) < (new Date(Date.now()).getTime() / 1000)) {
                        refund.push(unstake_item);

                    } else {
                        unstaking.push(unstake_item);
                    }

                });
            }

            const total_unstaking = unstaking.reduce((acc: any, item: any) => {
                return Asset.fromUnits(acc.units.adding(item.stake.units), acc.symbol);
            }, Asset.fromUnits(0, balance.symbol));
            const total_refund = refund.reduce((acc: any, item: any) => {
                return Asset.fromUnits(acc.units.adding(item.stake.units), acc.symbol);
            }, Asset.fromUnits(0, balance.symbol));
            const liquid = Asset.fromUnits(balance.units.subtracting(staked.stake.units).subtracting(total_unstaking.units), balance.symbol);
            console.log("dac_id", planet.scope);
            return {
                planet_name: planet.planet_name,
                dac_id: planet.scope,
                balance,
                staked: staked.stake,
                unstaking,
                total_unstaking,
                refund,
                total_refund,
                liquid
            }
        });
        return { balances, tlm_balance };
    });
}

export async function get_member_info(user: string) {

    let data: any = await Promise.all(AW_PLANETS.filter((planet: any) => {
        return planet.token_symbol !== 'TESTA';
    }).map(async (planet: any) => {
        const planetScope = planet.scope;
        const member_cursor: any = retryAsync(() => getSingleData(AW_TOKEN.CONTRACT_NAME, planetScope, AW_TOKEN.TABLES.MEMBERS, user));
        return member_cursor;
    }));
    if (!data) return [];
    data = data.map((item: any, index: any) => {
        return { member: item, planet: AW_PLANETS[index] }
    });
    data = data.filter((item: any) => { return item.member !== undefined });

    data = await Promise.all(data.map(async (item: any) => {
        let stake_time: any = await retryAsync(() => getSingleData(AW_TOKEN.CONTRACT_NAME, item.planet.scope, AW_TOKEN.TABLES.STAKE_TIME, user));

        if (!stake_time) {

            // get default stake time config
            const res: any = await retryAsync(() => getSingleData(AW_TOKEN.CONTRACT_NAME, item.planet.scope, AW_TOKEN.TABLES.STAKE_CONFIG));
            stake_time = parseInt(res.min_stake_time);
        } else {
            stake_time = parseInt(stake_time.delay);
        }

        return { ...item, stake_time };
    }));

    return data;
}