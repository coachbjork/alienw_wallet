<script lang="ts">
	import LinearRatio from '$lib/components/LinearRatio.svelte';
	import PlanetMenu from '$lib/components/Menu/PlanetMenu.svelte';
	import RecursiveObjectDisplay from '$lib/components/RecursiveObjectDisplay.svelte';
	import ReferendumAction from '$lib/components/SidePanel/ReferendumAction.svelte';
	import Badge from '$lib/components/Text/Badge.svelte';
	import { AW, AW_REFERENDUM, AW_WORKER_PROPOSALS, TOAST_TYPES } from '$lib/constants';
	import {
		get_deposited_bal,
		get_referendums,
		get_referundum_cursor,
		get_votes_by_user
	} from '$lib/services/awReferendumService';
	import { activePlanetStore, session, toastStore } from '$lib/stores';
	import type { Planet } from '$lib/types';
	import { pushActions } from '$lib/utils/wharfkit/session';
	import { Spinner } from 'flowbite-svelte';
	import { LabelSolid } from 'flowbite-svelte-icons';
	import moment from 'moment';
	import { afterUpdate, onMount } from 'svelte';

	let refItems: any = [];
	let more: boolean = true;
	let loading = true;
	let loadingMore = true;
	let selectedPlanet: Planet = $activePlanetStore;
	let selectedRef: any = null;
	// let config: any = {};
	let userDeposited: any = {};
	let userVotes: any = {};
	let isModalOpen = false;
	let isDelegateModalOpen = false;
	let isDelegate = false;
	let next_page_key: any = undefined;

	onMount(async () => {
		Promise.all([fetchReferendums()]).then(() => {
			loading = false;
		});
	});

	afterUpdate(async () => {
		if (selectedPlanet !== $activePlanetStore) {
			selectedPlanet = $activePlanetStore;
			selectedRef = null;
			loading = true;
			more = true;
			loadingMore = true;
			next_page_key = undefined;
			refItems = [];
			Promise.all([fetchReferendums()]).then(() => {
				loading = false;
			});

			if ($session) {
				Promise.all([fetchUserVotes(), fetchUserDepositedBal()]);
			}
		}
	});

	$: $session && Promise.all([fetchUserVotes(), fetchUserDepositedBal()]);

	async function fetchReferendums() {
		loadingMore = true;
		const cursor = await get_referundum_cursor($activePlanetStore.name, next_page_key, 10);
		if (!cursor) return;
		if (more) {
			const { rows, next_key, planetName } = await get_referendums(cursor);
			if (planetName !== $activePlanetStore.name) return;
			refItems = [...refItems, ...rows];
			next_page_key = next_key;
			more = rows.length >= 10;
		}
		loading = false;
		loadingMore = false;
	}

	// async function fetchRefCfgs() {
	// 	let response = await get_ref_cfg($activePlanetStore.name);
	// 	if (!response) return;
	// 	config = response;
	// }

	async function fetchUserDepositedBal() {
		if (!$session) return;
		let response = await get_deposited_bal(String($session.actor));
		if (!response) return;
		userDeposited = response;
	}

	async function fetchUserVotes() {
		if (!$session) return;
		let response = await get_votes_by_user($activePlanetStore.name, String($session.actor));
		if (!response) return;
		userVotes = response;
	}

	function selectRefItem(item: any) {
		if (selectedRef && selectedRef.referendum_id == item.referendum_id) {
			selectedRef = null;
			return;
		} else {
			selectedRef = item;
		}
	}

	function getStatusName(state: string) {
		switch (state) {
			case AW_REFERENDUM.STATUS.OPEN.value:
				return AW_REFERENDUM.STATUS.OPEN.name;
			case AW_REFERENDUM.STATUS.PASSING.value:
				return AW_REFERENDUM.STATUS.PASSING.name;
			case AW_REFERENDUM.STATUS.FAILING.value:
				return AW_REFERENDUM.STATUS.FAILING.name;
			case AW_REFERENDUM.STATUS.QUORUM_UNMET.value:
				return AW_REFERENDUM.STATUS.QUORUM_UNMET.name;
			case AW_REFERENDUM.STATUS.EXPIRED.value:
				return AW_REFERENDUM.STATUS.EXPIRED.name;
			case AW_REFERENDUM.STATUS.EXECUTED.value:
				return AW_REFERENDUM.STATUS.EXECUTED.name;
			default:
				return 'Unknown';
		}
	}

	function getRefTypeName(type: string) {
		switch (type) {
			case AW_REFERENDUM.REF_TYPE.BINDING.value:
				return AW_REFERENDUM.REF_TYPE.BINDING.name;
			case AW_REFERENDUM.REF_TYPE.SEMI_BINDING.value:
				return AW_REFERENDUM.REF_TYPE.SEMI_BINDING.name;
			case AW_REFERENDUM.REF_TYPE.OPINION.value:
				return AW_REFERENDUM.REF_TYPE.OPINION.name;
			default:
				return 'Unknown';
		}
	}

	function getRefCountTypeName(type: string) {
		switch (type) {
			case AW_REFERENDUM.COUNT_TYPE.TOKEN.value:
				return AW_REFERENDUM.COUNT_TYPE.TOKEN.name;
			case AW_REFERENDUM.COUNT_TYPE.ACCOUNT.value:
				return AW_REFERENDUM.COUNT_TYPE.ACCOUNT.name;

			default:
				return 'Unknown';
		}
	}

	function getVoteRatio(votes: any, referendum_id: number) {
		let data = votes.map((item: any) => {
			let userVoted = false;
			if (userVotes && userVotes.votes) {
				let voteSelected = userVotes.votes.find((v: any) => v.referendum_id == referendum_id);

				if (voteSelected) {
					userVoted = voteSelected.vote == item.name;
				}
			}
			return {
				name: `${item.name.charAt(0).toUpperCase() + item.name.slice(1)}`,
				ratio: item.value,
				color:
					item.name == AW_REFERENDUM.VOTE.YES.value
						? 'green'
						: item.name == AW_REFERENDUM.VOTE.NO.value
							? 'red'
							: 'gray',
				selected: userVoted
			};
		});

		// if all 0, set all to 1
		if (data.every((item: any) => item.ratio == 0)) {
			data = data.map((item: any) => {
				return { ...item, ratio: 1 };
			});
		}
		return data;
	}

	async function handleCreateProposalAction(proposal: any) {
		if (!$session) {
			toastStore.add('Please login to vote', TOAST_TYPES.WARNING);
			return;
		}

		const { title, summary, arbiter, proposal_pay, arbiter_pay, content_hash, id, job_duration } =
			proposal;

		let actions = [
			{
				account: AW_WORKER_PROPOSALS.CONTRACT_NAME,
				name: AW_WORKER_PROPOSALS.ACTIONS.CREATE_PROPOSAL,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					proposer: String($session.actor),
					title,
					summary,
					arbiter,
					proposal_pay: {
						quantity: `${proposal_pay.toFixed(4)} TLM`,
						contract: AW.CONTRACT_NAME
					},
					arbiter_pay: {
						quantity: `${arbiter_pay.toFixed(4)} TLM`,
						contract: AW.CONTRACT_NAME
					},
					content_hash,
					id,
					category: 0,
					job_duration,
					dac_id: $activePlanetStore.scope
				}
			}
		];
		return pushActions($session, actions);
	}

	function closeModal() {
		isModalOpen = false;
	}

	async function handleDelegateAction(data: any) {
		if (!$session) {
			toastStore.add('Please login to vote', TOAST_TYPES.WARNING);
			return;
		}

		const { proposal_id, delegatee_custodian, delegate_mode, category } = data;
		let action_name = delegate_mode
			? delegate_mode == AW_WORKER_PROPOSALS.DELEGATE_MODE.PROPOSAL
				? AW_WORKER_PROPOSALS.ACTIONS.DELEGATE_VOTE
				: AW_WORKER_PROPOSALS.ACTIONS.DELEGATE_VOTE_CATEGORY
			: AW_WORKER_PROPOSALS.ACTIONS.UNDELEGATE_VOTE;
		let actionData = delegate_mode
			? delegate_mode == AW_WORKER_PROPOSALS.DELEGATE_MODE.PROPOSAL
				? { proposal_id, delegatee_custodian }
				: { category, delegatee_custodian }
			: { category };
		let actions = [
			{
				account: AW_WORKER_PROPOSALS.CONTRACT_NAME,
				name: action_name,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					...actionData,
					custodian: $session.actor,
					dac_id: $activePlanetStore.scope
				}
			}
		];
		return pushActions($session, actions);
	}

	function closeDelegateModal() {
		isDelegateModalOpen = false;
		isDelegate = false;
	}
</script>

<div class="main-content py-6">
	<div class="container">
		<PlanetMenu />
		<div class="pt-10">
			{#if loading}
				<div class="flex justify-center">
					<Spinner color="purple" />
				</div>
			{:else if refItems.length == 0}
				<div class="flex justify-center">No Data</div>
			{:else}
				<div class="flex flex-col gap-6">
					{#each refItems as refItem}
						<button class="flex flex-row" on:click={() => selectRefItem(refItem)}>
							<div class="w-8 flex-none place-self-center">
								{#if selectedRef && selectedRef.referendum_id == refItem?.referendum_id}
									<LabelSolid class="text-stone-300 h-5 w-5 " />
								{/if}
							</div>
							<div
								class={`grow rounded-2xl border border-solid p-5 shadow-md  ${
									refItem.status == AW_REFERENDUM.STATUS.OPEN.value
										? 'border-blue-700 shadow-blue-700'
										: refItem.status == AW_REFERENDUM.STATUS.PASSING.value
											? 'border-green-700 shadow-green-700'
											: refItem.status == AW_REFERENDUM.STATUS.FAILING.value
												? 'border-yellow-700 shadow-yellow-700'
												: refItem.status == AW_REFERENDUM.STATUS.QUORUM_UNMET.value
													? 'border-purple-700 shadow-purple-700'
													: refItem.status == AW_REFERENDUM.STATUS.EXPIRED.value
														? 'border-gray-700 shadow-gray-700'
														: refItem.status == AW_REFERENDUM.STATUS.EXECUTED.value
															? 'border-blue-700 shadow-blue-700'
															: ''
								} ${
									refItem.referendum_id == selectedRef?.referendum_id
										? 'backdrop-brightness-200'
										: 'backdrop-brightness-125'
								}`}
							>
								<div class="flex flex-row flex-wrap">
									<div class="flex flex-none basis-2/12 flex-col text-start">
										<div>
											#: <span class="text-white underline">{refItem.referendum_id}</span>
										</div>
										<!-- <div
											class={`${
												refItem.status == AW_REFERENDUM.STATUS.OPEN.value
													? 'text-blue-700'
													: refItem.status == AW_REFERENDUM.STATUS.PASSING.value
														? 'text-green-700 '
														: refItem.status == AW_REFERENDUM.STATUS.FAILING.value
															? 'text-yellow-700 '
															: refItem.status == AW_REFERENDUM.STATUS.QUORUM_UNMET.value
																? 'text-purple-700'
																: refItem.status == AW_REFERENDUM.STATUS.EXPIRED.value
																	? 'text-gray-700'
																	: refItem.status == AW_REFERENDUM.STATUS.EXECUTED.value
																		? 'text-blue-700'
																		: ''
											}`}
										>
											{getStatusName(refItem.status)}
										</div> -->
										<div>
											<Badge
												color={`${
													refItem.status == AW_REFERENDUM.STATUS.OPEN.value
														? 'blue'
														: refItem.status == AW_REFERENDUM.STATUS.PASSING.value
															? 'green'
															: refItem.status == AW_REFERENDUM.STATUS.FAILING.value
																? 'yellow '
																: refItem.status == AW_REFERENDUM.STATUS.QUORUM_UNMET.value
																	? 'purple'
																	: refItem.status == AW_REFERENDUM.STATUS.EXPIRED.value
																		? 'gray'
																		: refItem.status == AW_REFERENDUM.STATUS.EXECUTED.value
																			? 'blue'
																			: 'gray'
												}`}
											>
												{getStatusName(refItem.status)}
											</Badge>
										</div>
									</div>
									<div class="mx-3 flex-none basis-3/12 flex-col text-start">
										<div>
											Title:
											<span class="text-white">
												{refItem.title}
											</span>
										</div>
										<div>
											Proposer: <span class="text-white">{refItem.proposer}</span>
										</div>
									</div>
									<div class="mx-3 flex flex-1 flex-col text-start">
										<div>
											Type: <span class="text-white">
												{getRefTypeName(refItem.type)}
											</span>
										</div>
										<div>
											Counting Method: <span class="text-white"
												>{getRefCountTypeName(refItem.voting_type)}</span
											>
										</div>
									</div>
									<div class="mx-auto flex flex-none basis-3/12 flex-col text-center">
										{#if refItem.voting_type == AW_REFERENDUM.COUNT_TYPE.TOKEN.value}
											<div>
												<LinearRatio
													items={getVoteRatio(refItem.token_votes, refItem.referendum_id)}
												/>
											</div>
										{/if}
										{#if refItem.voting_type == AW_REFERENDUM.COUNT_TYPE.ACCOUNT.value}
											<div>
												<LinearRatio
													items={getVoteRatio(refItem.account_votes, refItem.referendum_id)}
												/>
											</div>
										{/if}
										<div class="mt-1">
											Expired At: <span class=" text-white">
												{moment(refItem.expires).format('YYYY-MM-DD HH:mm:ss')}
											</span>
										</div>
									</div>

									<div
										class="mx-auto mb-3 mt-5 w-2/3 border-t-2 border-dotted border-gray-500"
									></div>
									<div class="w-full text-start">
										<div>
											Tx ID: <a
												href={`https://waxblock.io/transaction/${refItem.content_ref}`}
												target="_blank"
												><span class="italic text-blue-400 underline">
													{refItem.content_ref}</span
												></a
											>
										</div>

										<!-- for each actions in item -->
										{#each refItem.acts as action}
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
									</div>
									<!-- </div> -->
								</div>
								<div class="w-8 flex-none"></div>
							</div></button
						>
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
									fetchReferendums();
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
<div class="left-side">
	<!-- {#if $session}{/if} -->
</div>
<div class="right-side">
	<ReferendumAction selectedItem={selectedRef} />
</div>

<style>
</style>
