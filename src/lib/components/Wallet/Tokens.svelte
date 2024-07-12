<script lang="ts">
	import { get_balances, get_member_info } from '$lib/services/awStakingService';
	import { session } from '$lib/stores';
	import { Asset } from '@wharfkit/antelope';
	import { Spinner } from 'flowbite-svelte';
	import _ from 'lodash';
	import { afterUpdate, createEventDispatcher, onMount } from 'svelte';

	let balances: any = [];
	let tlm_balance: any = Asset.from('0.0000 TLM');
	let loading = true;
	let memberInfo: any = [];
	let selectedIndex: any = 0;
	const dispatch = createEventDispatcher();

	onMount(async () => {});

	afterUpdate(async () => {});

	export async function refresh() {
		if ($session) {
			Promise.all([fetchBalance()]).then(async () => {
				await fetchMemberInfo();
				loading = false;
			});
		}
	}

	$: $session &&
		Promise.all([fetchBalance()]).then(async () => {
			await fetchMemberInfo();
			loading = false;
		});

	async function fetchBalance() {
		loading = true;
		// const response = await get_balances('3.haw.wam');
		const response = await get_balances(String($session?.actor));
		if (!response) return;
		balances = response.balances;
		tlm_balance = response.tlm_balance;
		dispatch('tlmBalance', tlm_balance);
	}

	async function fetchMemberInfo() {
		// const response = await get_member_info('3.haw.wam');
		const response = await get_member_info(String($session?.actor));
		if (!response) return;
		memberInfo = response;
		dispatch('memberInfo', memberInfo);
	}

	function selectBalance(index: any) {
		selectedIndex = index;
		dispatch('selectedBalance', balances[index]);
	}

	function getStakeTime(item: any) {
		let stakeTime =
			_.find(memberInfo, (info: any) => info?.planet?.scope === item?.dac_id)?.stake_time || 0;
		let stakeDays = `${stakeTime / 86400 != 0 ? stakeTime / 86400 : '00'} days`;
		return stakeDays;
	}
</script>

<h1 class="mb-6 ml-3 text-start text-2xl font-bold text-orange-500 md:ml-0 md:text-center">
	Tokens
</h1>
<div class="text-default ml-3 flex flex-row text-lg">
	<p class="">TLM balance:</p>
	<p class="ml-3 font-medium text-indigo-400">{String(tlm_balance)}</p>
</div>
<div class="mt-10 overflow-x-auto">
	<table class="text-default w-full table-auto text-nowrap text-left text-lg md:text-xl">
		<thead>
			<tr>
				<th>#</th>
				<th>Total</th>
				<th>Liquid</th>
				<th>Staked</th>
				<th>Unstaking</th>
				<th>Refund</th>
			</tr>
		</thead>
		<tbody class="text-lg md:text-xl">
			{#if $session}
				{#if loading}
					<tr>
						<td colspan="7" class="text-center">
							<Spinner color="purple" />
						</td>
					</tr>
				{:else}
					{#each balances as item, i}
						<tr class="odd:backdrop-brightness-150" on:click={() => selectBalance(i)}>
							<td>
								<input
									type="radio"
									class={`rounded-lg`}
									on:click={(e) => {
										selectBalance(i);
									}}
									value={i}
									checked={selectedIndex === i}
								/>
							</td>
							<td>{String(item.balance)}</td>
							<td>{String(item.liquid)}</td>
							<td>{String(item.staked)} ({getStakeTime(item)})</td>
							<td>{String(item.total_unstaking)}</td>
							<td>{String(item.total_refund)}</td>
						</tr>
					{/each}
				{/if}
			{:else}
				<tr>
					<td colspan="7" class="text-center">Please login to view your tokens</td>
				</tr>
			{/if}
		</tbody>
	</table>
</div>

<style>
	table tbody tr {
		@apply border-y border-solid border-gray-500;
	}

	table td {
		@apply p-2;
		/* padding: 0.75rem 0.75rem;
		color: #b5b7bb; */
	}

	table th {
		@apply pb-3 pl-3 pr-3 pt-0 text-left text-lg font-bold;
	}
</style>
