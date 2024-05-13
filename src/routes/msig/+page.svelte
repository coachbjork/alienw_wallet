<script lang="ts">
	import PlanetMenu from '$lib/components/Menu/PlanetMenu.svelte';
	import RecursiveObjectDisplay from '$lib/components/RecursiveObjectDisplay.svelte';
	import MsigProposalAction from '$lib/components/SidePanel/Actions/MsigProposalAction.svelte';
	import Badge from '$lib/components/Text/Badge.svelte';
	import { AW_MSIG } from '$lib/constants';
	import { get_msig_cursor, get_msigs } from '$lib/services/awMsigPropService';
	import { get_dacglobals } from '$lib/services/awdaoService';
	import { activePlanetStore } from '$lib/stores';
	import type { Planet } from '$lib/types';
	import { Spinner } from 'flowbite-svelte';
	import LabelSolid from 'flowbite-svelte-icons/LabelSolid.svelte';
	import moment from 'moment';
	import { afterUpdate, onMount } from 'svelte';

	let proposals: any = [];
	let next_page_key: any = undefined;
	let more: boolean = true;
	let loading = true;
	let loadingMore = true;
	let selectedPlanet: Planet = $activePlanetStore;
	let selectedProposal: any = null;
	let ableToClaimBudget = false;
	let lastclaimbudgettime = new Date(0);
	let lastperiodtime = new Date(0);

	onMount(async () => {
		await fetchMsigs();
		await fetchDacglobals();
	});

	afterUpdate(async () => {
		if (selectedPlanet !== $activePlanetStore) {
			selectedPlanet = $activePlanetStore;
			refresh();
			await fetchDacglobals();
		}
	});

	async function fetchMsigs() {
		loadingMore = true;
		const cursor = await get_msig_cursor($activePlanetStore.name, next_page_key, 10);
		if (!cursor) return;
		if (more) {
			const { rows, next_key, planetName } = await get_msigs(cursor);
			if (planetName !== $activePlanetStore.name) return;
			proposals = [...proposals, ...rows];
			next_page_key = next_key;
			more = rows.length >= 10;
		}
		loadingMore = false;
		loading = false;
	}
	async function refresh() {
		loading = true;
		more = true;
		selectedProposal = null;
		next_page_key = undefined;
		proposals = [];
		await fetchMsigs();
	}

	async function fetchDacglobals() {
		const response = await get_dacglobals($activePlanetStore.name);
		if (!response) return;
		lastclaimbudgettime =
			response.find((dacglobal: any) => dacglobal.key === 'lastclaimbudgettime').value[1] || 1;
		lastperiodtime =
			response.find((dacglobal: any) => dacglobal.key === 'lastperiodtime').value[1] || 1;

		ableToClaimBudget = lastclaimbudgettime < lastperiodtime;
	}

	function selectProposal(proposal: any) {
		if (selectedProposal && selectedProposal.proposal_id == proposal.proposal_id) {
			selectedProposal = null;
			return;
		} else {
			selectedProposal = proposal;
		}
	}

	function getStateName(status: number) {
		switch (status) {
			case AW_MSIG.PROP_STATE.PENDING.value:
				return AW_MSIG.PROP_STATE.PENDING.name;
			case AW_MSIG.PROP_STATE.EXECUTED.value:
				return AW_MSIG.PROP_STATE.EXECUTED.name;
			case AW_MSIG.PROP_STATE.CANCELLED.value:
				return AW_MSIG.PROP_STATE.CANCELLED.name;
			default:
				return 'Unknown';
		}
	}

	function getApprovedBy(proposal: any) {
		return proposal?.approved_by?.join(', ') || '';
	}
</script>

<div class="main-content py-6">
	<div class="container relative overflow-x-hidden">
		<PlanetMenu />
		<div class="mt-10 overflow-x-auto">
			{#if loading}
				<div class="flex justify-center">
					<Spinner color="purple" />
				</div>
			{:else if proposals.length == 0}
				<div class="flex justify-center">No Data</div>
			{:else}
				<div class="flex flex-col gap-6">
					{#each proposals as proposal}
						<button class="flex flex-row" on:click={() => selectProposal(proposal)}>
							<div class="w-8 flex-none place-self-center">
								{#if selectedProposal && selectedProposal.proposal_id == proposal?.proposal_id}
									<LabelSolid class="text-stone-300 h-5 w-5 " />
								{/if}
							</div>
							<div
								class={`grow rounded-2xl border border-solid p-5 shadow-md  ${
									proposal.proposal_status == AW_MSIG.PROP_STATE.PENDING.value
										? 'border-yellow-700 shadow-yellow-700'
										: proposal.proposal_status == AW_MSIG.PROP_STATE.EXECUTED.value
											? 'border-blue-700 shadow-blue-700'
											: proposal.proposal_status == AW_MSIG.PROP_STATE.CANCELLED.value
												? 'border-red-700 shadow-red-700'
												: ''
								} ${
									proposal.proposal_id == selectedProposal?.proposal_id
										? 'backdrop-brightness-200'
										: 'backdrop-brightness-125'
								}`}
							>
								<div class="flex flex-row flex-wrap">
									<div class="flex flex-none basis-2/12 flex-col text-start">
										<div>
											#: <span class="text-white underline">{proposal.proposal_id}</span>
										</div>
										<div>
											<Badge
												color={`${
													proposal.proposal_status == AW_MSIG.PROP_STATE.PENDING.value
														? 'yellow'
														: proposal.proposal_status == AW_MSIG.PROP_STATE.EXECUTED.value
															? 'blue'
															: proposal.proposal_status == AW_MSIG.PROP_STATE.CANCELLED.value
																? 'red'
																: 'gray'
												}`}
											>
												{getStateName(proposal.proposal_status)}
											</Badge>
										</div>
									</div>
									<div class="mx-3 flex-none basis-3/12 flex-col text-start">
										<div>
											Title: <span class="text-white">{proposal.proposal_title}</span>
										</div>
										<div>
											Approved by: <span class="text-white">{getApprovedBy(proposal)}</span>
										</div>

										<!-- <div>
											Proposer Pay: <span class="text-white">{proposal.proposal_pay.quantity}</span>
										</div>
										<div>
											Document: <a
												class="text-blue-400 underline"
												target="_blank"
												href={`${PUBLIC_PINATA_GATEWAY}/ipfs/${proposal.content_hash}/?pinataGatewayToken=${PUBLIC_PINATA_GATEWAY_KEY}`}
												>Get File</a
											>
										</div> -->
									</div>
									<div class="mx-3 flex flex-1 flex-col text-start">
										<div>Proposer: <span class="text-white">{proposal.proposer}</span></div>
									</div>
									<div class="mx-auto flex flex-none basis-3/12 flex-col text-start">
										<div>
											Updated At: <span class="text-white">
												{moment(proposal.modified_date).format('YYYY-MM-DD HH:mm:ss')}
											</span>
										</div>

										<div>
											Expired At: <span class="text-white">
												{moment(proposal.expiration).format('YYYY-MM-DD HH:mm:ss')}
											</span>
										</div>
									</div>
								</div>

								<div class="mx-auto mb-3 mt-5 w-2/3 border-t-2 border-dotted border-gray-500"></div>
								<div class="text-start">
									<div>
										Description: <span class="text-white">
											{#each proposal.description.split('\n') as line}
												{line}
												<br />
											{/each}</span
										>
									</div>

									<!-- <div class="mt-2"> -->
									<!-- for each actions in proposal -->
									{#each proposal.actions as action}
										<div class="mt-2 flex flex-row flex-wrap">
											<div class="flex-none basis-5/12">
												Action: <span class="text-white"
													>{action.contract_name} - {action.action_name}</span
												>
											</div>
											<div class=" mx-auto basis-6/12 overflow-auto text-ellipsis">
												Data: <span class=" text-white"
													><RecursiveObjectDisplay data={action.action_data} /></span
												>
											</div>
										</div>
									{/each}
									<!-- </div> -->
								</div>
							</div>
							<div class="w-8 flex-none"></div>
						</button>
					{/each}
					<!-- Load More button -->
					<div class="flex justify-center">
						{#if loadingMore}
							<div class="flex justify-center">
								<Spinner color="purple" />
							</div>
						{:else}
							<button
								class="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
								on:click={() => {
									fetchMsigs();
								}}
							>
								Load More
							</button>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
<div class="left-side md:flex"></div>
<div class="right-side md:flex">
	<MsigProposalAction {selectedProposal} {ableToClaimBudget} on:refresh={refresh} />
</div>

<style>
</style>
