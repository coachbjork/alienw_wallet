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
	import moment from 'moment';
	import { afterUpdate, onMount } from 'svelte';
	import CrosshairsSolid from 'svelte-awesome-icons/CrosshairsSolid.svelte';

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
				<div class="my-4 flex justify-center md:my-5">
					<Spinner color="purple" />
				</div>
			{:else if proposals.length == 0}
				<div class="my-4 flex justify-center md:my-5">No Data</div>
			{:else}
				<div class="my-4 flex flex-col gap-6 md:my-5">
					{#each proposals as proposal}
						<button
							class="flex w-full flex-row items-center"
							on:click={() => selectProposal(proposal)}
						>
							<div class="w-8 flex-none">
								{#if selectedProposal && selectedProposal.proposal_id == proposal?.proposal_id}
									<CrosshairsSolid color="#ecc94b" size="24" />
								{/if}
							</div>
							<div
								class={`flex-grow whitespace-normal break-words break-all rounded-2xl border p-4 shadow-md ${
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
								<div class="flex flex-col justify-between gap-4 md:flex-row">
									<div class="flex flex-col text-start">
										<div class="text-sm md:text-base">
											#: <span class="text-base font-semibold text-white underline md:text-lg"
												>{proposal.proposal_id}</span
											>
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
									<div class="flex flex-col text-start">
										<div class="text-sm md:text-base">
											Title: <span class="text-white">{proposal.proposal_title}</span>
										</div>
										<div class="text-sm md:text-base">
											Approved by: <span class="text-white">{getApprovedBy(proposal)}</span>
										</div>
									</div>
									<div class="flex flex-col text-start">
										<div class="text-sm md:text-base">
											Proposer: <span
												class="text-base font-semibold text-white underline md:text-lg"
												>{proposal.proposer}</span
											>
										</div>
									</div>
									<div class="flex flex-col text-start">
										<div class="text-sm md:text-base">
											Updated At: <span class="text-white">
												{moment(proposal.modified_date).format('YYYY-MM-DD HH:mm:ss')}
											</span>
										</div>
										<div class="text-sm md:text-base">
											Expired At: <span class="text-white">
												{moment(proposal.expiration).format('YYYY-MM-DD HH:mm:ss')}
											</span>
										</div>
									</div>
								</div>
								<div class="mx-auto my-3 w-2/3 border-t-2 border-dotted border-gray-500"></div>
								<div class="text-start">
									<div class="text-sm md:text-base">
										Description: <span class="text-white">
											{#each proposal.description.split('\n') as line}
												{line}
												<br />
											{/each}</span
										>
									</div>
									{#each proposal.actions as action}
										<div class="mt-2 flex flex-row flex-wrap">
											<div class="basis-full text-sm md:basis-3/12 md:text-base">
												Action: <span class="text-white"
													>{action.contract_name} - {action.action_name}</span
												>
											</div>
											<div
												class="basis-full overflow-auto text-ellipsis text-sm md:basis-6/12 md:text-base"
											>
												Data: <span class="text-white"
													><RecursiveObjectDisplay data={action.action_data} /></span
												>
											</div>
										</div>
									{/each}
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
