<script lang="ts">
	import StakeModal from '$lib/components/Modal/StakeModal.svelte';
	import StakeTimeModal from '$lib/components/Modal/StakeTimeModal.svelte';
	import WalletAction from '$lib/components/SidePanel/Actions/WalletAction.svelte';
	import { get_balances, get_member_info } from '$lib/services/awStakingService';
	import { session } from '$lib/stores';
	import { Asset } from '@wharfkit/antelope';
	import { Spinner } from 'flowbite-svelte';
	import _ from 'lodash';
	import { afterUpdate, onMount } from 'svelte';

	let balances: any = [];
	let tlm_balance: any = Asset.from('0.0000 TLM');
	let loading = true;
	let memberInfo: any = [];
	let selectedIndex: any = 0;
	let stakeModal: any;
	let stakeTimeModal: any;

	onMount(async () => {});

	afterUpdate(async () => {});

	$: $session &&
		Promise.all([fetchBalance()]).then(async () => {
			await fetchMemberInfo();
			loading = false;
		});

	async function refresh() {
		if ($session) {
			Promise.all([fetchBalance()]).then(async () => {
				await fetchMemberInfo();
				loading = false;
			});
		}
	}

	async function fetchBalance() {
		loading = true;
		// const response = await get_balances('3.haw.wam');
		const response = await get_balances(String($session?.actor));
		if (!response) return;
		balances = response.balances;
		tlm_balance = response.tlm_balance;
	}

	async function fetchMemberInfo() {
		// const response = await get_member_info('3.haw.wam');
		const response = await get_member_info(String($session?.actor));
		if (!response) return;
		memberInfo = response;
	}

	function selectBalance(index: any) {
		selectedIndex = index;
	}

	function getStakeTime(item: any) {
		let stakeTime =
			_.find(memberInfo, (info: any) => info?.planet?.scope === item?.dac_id)?.stake_time || 0;
		let stakeDays = `${stakeTime / 86400 != 0 ? stakeTime / 86400 : '00'} days`;
		return stakeDays;
	}
</script>

<div class="main-content py-6">
	<div class="container relative overflow-x-hidden">
		<h1 class="mb-6 text-center text-2xl font-bold">Wallet</h1>
		<div class="text-default ml-3 flex flex-row text-lg">
			<p class="">TLM balance:</p>
			<p class="ml-3 font-medium">{String(tlm_balance)}</p>
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
	</div>
</div>
<div class="left-side md:flex"></div>
<div class="right-side md:flex">
	{#if !loading && $session}
		<WalletAction
			selectedItem={balances[selectedIndex]}
			{memberInfo}
			on:stake={(data) => stakeModal.setModalOpen(true, data.detail)}
			on:stakeTime={(data) => stakeTimeModal.setModalOpen(true, data.detail)}
			on:refresh={refresh}
		/>
	{/if}
	<!-- on:stakeTime={(data) => stakeModal.setModalOpen(true, data)} -->
</div>
<StakeModal bind:this={stakeModal} on:refresh={refresh} {tlm_balance} />
<StakeTimeModal bind:this={stakeTimeModal} on:refresh={refresh} />

<style>
	/* .container {
		max-width: 100%;
		overflow-x: hidden;
	} */
	/* Table */
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
