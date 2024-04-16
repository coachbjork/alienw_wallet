<script lang="ts">
	import PlanetMenu from '$lib/components/Menu/PlanetMenu.svelte';
	import RecursiveObjectDisplay from '$lib/components/RecursiveObjectDisplay.svelte';
	import ReferendumAction from '$lib/components/SidePanel/ReferendumAction.svelte';
	import Badge from '$lib/components/Text/Badge.svelte';
	import VoteLinearRatio from '$lib/components/VoteLinearRatio.svelte';
	import { AW_REFERENDUM, TOAST_TYPES } from '$lib/constants';
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
				vote_type: item.name,
				value: item.value,
				color:
					item.name == AW_REFERENDUM.VOTE.YES.value
						? 'green'
						: item.name == AW_REFERENDUM.VOTE.NO.value
							? 'red'
							: 'gray',
				selected: userVoted
			};
		});

		return data;
	}

	async function onVote(vote_type: string, referendum_id: number) {
		if (!$session) {
			toastStore.add('Please login to call action', TOAST_TYPES.WARNING);
			return;
		}

		let actions = [
			{
				account: AW_REFERENDUM.CONTRACT_NAME,
				name: AW_REFERENDUM.ACTIONS.CLEAN,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					account: String($session.actor),
					dac_id: $activePlanetStore.scope
				}
			},
			{
				account: AW_REFERENDUM.CONTRACT_NAME,
				name: AW_REFERENDUM.ACTIONS.VOTE,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					voter: String($session.actor),
					referendum_id: referendum_id,
					vote: vote_type,
					dac_id: $activePlanetStore.scope
				}
			}
		];
		await pushActions($session, actions);
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
										<!-- svelte-ignore a11y-click-events-have-key-events -->
										<!-- svelte-ignore a11y-no-static-element-interactions -->
										<div on:click|stopPropagation={() => {}}>
											{#if refItem.voting_type == AW_REFERENDUM.COUNT_TYPE.TOKEN.value}
												<VoteLinearRatio
													items={getVoteRatio(refItem.token_votes, refItem.referendum_id)}
													referendum_id={refItem.referendum_id}
													on:onVote={(e) => {
														if (e?.detail?.vote_type && e?.detail?.referendum_id) {
															onVote(e.detail.vote_type, e.detail.referendum_id);
														}
													}}
												/>
											{/if}
											{#if refItem.voting_type == AW_REFERENDUM.COUNT_TYPE.ACCOUNT.value}
												<VoteLinearRatio
													items={getVoteRatio(refItem.account_votes, refItem.referendum_id)}
													referendum_id={refItem.referendum_id}
													on:onVote={(e) => {
														if (e?.detail?.vote_type && e?.detail?.referendum_id) {
															onVote(e.detail.vote_type, e.detail.referendum_id);
														}
													}}
												/>
											{/if}
										</div>

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
										<!-- svelte-ignore a11y-click-events-have-key-events -->
										<!-- svelte-ignore a11y-no-static-element-interactions -->
										<div on:click|stopPropagation={() => {}}>
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
	<ReferendumAction
		selectedItem={selectedRef}
		on:onVote={(e) => {
			if (e?.detail?.vote_type && e?.detail?.referendum_id) {
				onVote(e.detail.vote_type, e.detail.referendum_id);
			}
		}}
	/>
</div>

<style>
</style>
