<script lang="ts">
	import PlanetMenu from '$lib/components/Menu/PlanetMenu.svelte';
	import RecursiveObjectDisplay from '$lib/components/RecursiveObjectDisplay.svelte';
	import MsigProposalAction from '$lib/components/SidePanel/MsigProposalAction.svelte';
	import { AW_MSIG } from '$lib/constants';
	import { get_dacglobals } from '$lib/services/awdaoService';
	import { activePlanetStore } from '$lib/stores';
	import type { Planet } from '$lib/types';
	import { Spinner } from 'flowbite-svelte';
	import LabelSolid from 'flowbite-svelte-icons/LabelSolid.svelte';
	import moment from 'moment';
	import { onMount } from 'svelte';

	let proposals: any = [];
	let loading = true;
	let selectedPlanet: Planet = $activePlanetStore;
	let selectedProposal: any = null;
	let ableToClaimBudget = false;
	let lastclaimbudgettime = new Date(0);
	let lastperiodtime = new Date(0);

	$: selectedPlanet !== $activePlanetStore && updateData();

	onMount(async () => {
		await fetchProposals();
		// await fetchMsigs();
		await fetchDacglobals();
		loading = false;
	});

	async function updateData() {
		{
			loading = true;
			selectedPlanet = $activePlanetStore;
			selectedProposal = null;
			proposals = [];
			await fetchProposals();
			await fetchDacglobals();
			loading = false;
		}
	}

	async function fetchProposals() {
		let api_response: any = await fetch(`/api/daoaw/msig_proposals/${$activePlanetStore.scope}`);
		api_response = await api_response.json();
		proposals = api_response;
	}

	// async function fetchMsigs() {
	// 	const cursor = await get_msig_cursor($activePlanetStore.name);
	// 	if (!cursor) return;
	// 	const response = await get_msigs(cursor);
	// 	// console.log(response);
	// }

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

	// function getApprovalState(proposal: any) {
	// 	if (
	// 		proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.PENDING_APPROVAL.value ||
	// 		proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.HAS_ENOUGH_APP_VOTES.value ||
	// 		proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.IN_PROGRESS.value
	// 	) {
	// 		// calculate how many approved vote
	// 		let approvedVotes = proposal.votes.filter(
	// 			(item: any) => item.vote == AW_WORKER_PROPOSALS.VOTE.VOTE_PROP_APPROVE.value
	// 		);
	// 		return `(${approvedVotes.length}/${wpConfig.proposal_threshold})`;
	// 	} else if (
	// 		proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.PENDING_FINALIZE.value ||
	// 		proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.HAS_ENOUGH_FIN_VOTES.value
	// 	) {
	// 		// calculate how many approved vote
	// 		let approvedVotes = proposal.votes.filter(
	// 			(item: any) => item.vote == AW_WORKER_PROPOSALS.VOTE.VOTE_FINAL_APPROVE.value
	// 		);
	// 		return `(${approvedVotes.length}/${wpConfig.finalize_threshold})`;
	// 	} else {
	// 		return '';
	// 	}
	// }

	function getApprovedBy(proposal: any) {
		return proposal.approved_by.join(', ');
	}

	// function getDeniedBy(proposal: any) {
	// 	if (
	// 		proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.PENDING_APPROVAL.value ||
	// 		proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.HAS_ENOUGH_APP_VOTES.value ||
	// 		proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.IN_PROGRESS.value
	// 	) {
	// 		let deniedByString = proposal.votes
	// 			.filter((item: any) => item.vote == AW_WORKER_PROPOSALS.VOTE.VOTE_PROP_DENY.value)
	// 			.map((item: any) => item.voter)
	// 			.join(', ');
	// 		return deniedByString;
	// 	} else if (
	// 		proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.PENDING_FINALIZE.value ||
	// 		proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.HAS_ENOUGH_FIN_VOTES.value
	// 	) {
	// 		let deniedByString = proposal.votes
	// 			.filter((item: any) => item.vote == AW_WORKER_PROPOSALS.VOTE.VOTE_FINAL_DENY.value)
	// 			.map((item: any) => item.voter)
	// 			.join(', ');
	// 		return deniedByString;
	// 	} else {
	// 		return '';
	// 	}
	// }

	// async function handleCreateProposalAction(proposal: any) {
	// 	if (!$session) {
	// 		toastStore.add('Please login to vote', TOAST_TYPES.WARNING);
	// 		return;
	// 	}

	// 	const { title, summary, arbiter, proposal_pay, arbiter_pay, content_hash, id, job_duration } =
	// 		proposal;

	// 	let actions = [
	// 		{
	// 			account: AW_WORKER_PROPOSALS.CONTRACT_NAME,
	// 			name: AW_WORKER_PROPOSALS.ACTIONS.CREATE_PROPOSAL,
	// 			authorization: [
	// 				{
	// actor: String($session.actor),
	// 				permission: String($session?.permission)
	// 				}
	// 			],
	// 			data: {
	// 				proposer: String($session.actor),
	// 				title,
	// 				summary,
	// 				arbiter,
	// 				proposal_pay: {
	// 					quantity: `${proposal_pay.toFixed(4)} TLM`,
	// 					contract: AW.CONTRACT_NAME
	// 				},
	// 				arbiter_pay: {
	// 					quantity: `${arbiter_pay.toFixed(4)} TLM`,
	// 					contract: AW.CONTRACT_NAME
	// 				},
	// 				content_hash,
	// 				id,
	// 				category: 0,
	// 				job_duration,
	// 				dac_id: $activePlanetStore.scope
	// 			}
	// 		}
	// 	];
	// 	return pushActions($session, actions);
	// }
</script>

<div class="main-content py-6">
	<div class="container">
		<PlanetMenu />
		<div class="pt-10">
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
								class={`flex-grow rounded-2xl border border-solid p-5 shadow-md  ${
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
										<div
											class={`${
												proposal.proposal_status == AW_MSIG.PROP_STATE.PENDING.value
													? 'text-yellow-500 '
													: proposal.proposal_status == AW_MSIG.PROP_STATE.EXECUTED.value
														? 'text-blue-500'
														: proposal.proposal_status == AW_MSIG.PROP_STATE.CANCELLED.value
															? 'text-red-500'
															: ''
											}`}
										>
											{getStateName(proposal.proposal_status)}
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
									<div class="flex flex-none basis-3/12 flex-col text-end">
										<div>Expiration At</div>
										<div class="text-white">
											{moment(`${proposal.expiration}Z`).format('YYYY-MM-DD HH:mm:ss')}
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

									<div class="mt-2">
										<!-- for each actions in proposal -->
										{#each proposal.actions as action}
											<div class="flex flex-row">
												<div class="flex-none basis-5/12">
													Action: <span class="text-white"
														>{action.contract_name} - {action.action_name}</span
													>
												</div>
												<div class="ml-10 flex flex-1">
													Data: <span class="text-white"
														><RecursiveObjectDisplay data={action.action_data} /></span
													>
												</div>
											</div>
										{/each}
									</div>
								</div>
							</div>
							<div class="w-8 flex-none"></div>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
<div class="left-side">
	<!-- {#if $session}{/if} -->
</div>
<div class="right-side">
	<MsigProposalAction {selectedProposal} {ableToClaimBudget} />
</div>

<style>
</style>
