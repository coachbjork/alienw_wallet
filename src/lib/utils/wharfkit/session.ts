// src/utils/vote.ts
import { TOAST_TYPES } from '$lib/constants';
import { toastStore } from '$lib/stores';

export async function pushActions(session: any, actions: any[]) {
    try {
        const res = await session.transact(
            {
                actions
            },
            {
                broadcast: true,
                expireSeconds: 120
            }
        );
        toastStore.add(
            `<div>Executed: <a class="underline underline-offset-2" href="https://waxblock.io/transaction/${res.response.transaction_id}" target={"_blank"}>View Tx</a></div>`,
            TOAST_TYPES.SUCCESS
        );
        return res;
    } catch (error: any) {
        toastStore.add(error.message, TOAST_TYPES.ERROR);
    }
}