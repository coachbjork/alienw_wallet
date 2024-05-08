<script lang="ts">
	import PlanetMenu from '$lib/components/Menu/PlanetMenu.svelte';
	import VotedFor from '$lib/components/SidePanel/VotedFor.svelte';
	import { AW_DAO, TOAST_TYPES } from '$lib/constants';
	import {
		get_candidates,
		get_dacglobals,
		get_staked_by_user,
		get_votes_by_user
	} from '$lib/services/awdaoService';
	import { activePlanetStore, session, toastStore } from '$lib/stores';
	import type { Planet } from '$lib/types';
	import { pushActions } from '$lib/utils/wharfkit/session';
	import { tooltip } from '@svelte-plugins/tooltips';
	import { Spinner } from 'flowbite-svelte';
	import _ from 'lodash';
	import { afterUpdate, onMount } from 'svelte';
	import CrownSolid from 'svelte-awesome-icons/CrownSolid.svelte';
	import ShareFromSquareRegular from 'svelte-awesome-icons/ShareFromSquareRegular.svelte';

	let candidates: any = [];
	let votedForCandidates: any = [];
	let maxvotes: any = 1;
	let selectedPlanet: Planet = $activePlanetStore;
	let loading = true;
	let selectedCandidates: any = [];
	let staked: string = '';

	onMount(async () => {
		Promise.all([fetchCandidates(), fetchDacglobals()]).then(() => {
			loading = false;
		});
	});

	afterUpdate(async () => {
		if (selectedPlanet !== $activePlanetStore) {
			selectedPlanet = $activePlanetStore;
			await refresh();
		}
	});

	$: $session && Promise.all([fetchVotedFor(), fetchStaked()]);

	async function refresh() {
		loading = true;
		selectedCandidates = [];
		votedForCandidates = [];
		staked = '';
		Promise.all([fetchCandidates(), fetchDacglobals()]).then(() => {
			loading = false;
		});

		if ($session) {
			Promise.all([fetchVotedFor(), fetchStaked()]);
		}
	}

	async function fetchCandidates() {
		let response = await get_candidates($activePlanetStore.name);
		if (!response) return;
		let api_response: any = await fetch(
			`/api/daoaw/candidates?activePlanet=${$activePlanetStore.name}`
		);
		api_response = await api_response.json();
		if (api_response) {
			response = response.map((item: any) => {
				return {
					...item,
					description: api_response[String(item.candidate_name)]?.description || '',
					image: api_response[String(item.candidate_name)]?.image || '',
					name: api_response[String(item.candidate_name)]?.name || String(item.candidate_name)
				};
			});
		}
		candidates = response;
	}

	async function fetchDacglobals() {
		const response = await get_dacglobals($activePlanetStore.name);
		if (!response) return;
		maxvotes = response.find((dacglobal: any) => dacglobal.key === 'maxvotes').value[1] || 1;
	}

	async function fetchVotedFor() {
		if ($session) {
			let response = await get_votes_by_user($activePlanetStore.name, String($session?.actor));
			if (!response) return;
			response = response.candidates.map((candidate: any) => {
				return candidates.find((c: any) => {
					return c.candidate_name === String(candidate);
				});
			});
			votedForCandidates = response.filter((candidate: any) => candidate !== undefined);
			selectedCandidates = votedForCandidates.map((candidate: any) => candidate.candidate_name);
		}
	}

	async function fetchStaked() {
		if ($session) {
			let response = await get_staked_by_user($activePlanetStore.name, String($session?.actor));
			if (!response) return;
			staked = String(response.stake);
		}
	}

	async function selectCandidate(e: any) {
		const { checked, value } = e.target;
		if (selectedCandidates.length >= maxvotes && checked) {
			toastStore.add(`Max vote is ${maxvotes}`, TOAST_TYPES.WARNING);
			e.target.checked = false;
			return;
		}
		if (checked) {
			selectedCandidates = [...selectedCandidates, value];
		} else {
			selectedCandidates = selectedCandidates.filter((candidate: any) => candidate !== value);
		}
	}

	async function onVote() {
		if (!$session) {
			toastStore.add('Please login to vote', TOAST_TYPES.ERROR);
			return;
		}
		let actions = [
			{
				account: AW_DAO.CONTRACT_NAME,
				name: AW_DAO.ACTIONS.VOTE_CUSTODIANS,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					voter: $session.actor,
					dac_id: selectedPlanet.scope,
					newvotes: selectedCandidates
				}
			}
		];
		await pushActions($session, actions).then(() => {
			refresh();
		});
	}
</script>

<div class="main-content py-6">
	<div class="container relative overflow-x-hidden">
		<PlanetMenu />
		<div class="mt-10 overflow-x-auto">
			<table class="text-default w-full table-auto text-left text-lg">
				<thead>
					<tr>
						<th>#</th>
						<th>Rank</th>
						<th>User</th>
						<th>Account</th>
						<th>Vote Power</th>
						<th class="">Voters</th>
						<th class="">Vote Decay</th>
					</tr>
				</thead>
				<tbody class="text-2xl">
					{#if loading}
						<tr>
							<td colspan="7" class="text-center">
								<Spinner color="purple" />
							</td>
						</tr>
					{:else}
						{#each candidates as candidate, i}
							<tr class="odd:backdrop-brightness-150">
								<td>
									<input
										type="checkbox"
										class={`rounded-md ${$session === null ? 'cursor-not-allowed bg-gray-500' : ''}`}
										on:change={(e) => {
											selectCandidate(e);
										}}
										value={candidate.candidate_name}
										disabled={$session === null}
										checked={_.find(votedForCandidates, {
											candidate_name: candidate.candidate_name
										})}
									/>
								</td>
								<td>
									{#if i <= 4}
										<CrownSolid color="white" />
									{:else}
										{i + 1}
									{/if}</td
								>
								<td class="flex items-center"
									>{candidate.name}
									<a
										href={`https://waxblock.io/account/${candidate.candidate_name}`}
										target="_blank"><ShareFromSquareRegular class="ml-2" /></a
									>
								</td>
								<td>{candidate.candidate_name}</td>
								<td
									>{new Intl.NumberFormat('en-US').format(
										candidate.total_vote_power.toFixed(0)
									)}</td
								>
								<td class="">{candidate.number_voters}</td>
								<td
									class={` ${
										candidate.vote_decay > 50
											? 'vote6'
											: candidate.vote_decay > 40
												? 'vote5'
												: candidate.vote_decay > 30
													? 'vote4'
													: candidate.vote_decay > 20
														? 'vote3'
														: candidate.vote_decay > 10
															? 'vote2'
															: candidate.vote_decay > 0
																? 'vote1'
																: ''
									}`}
									use:tooltip={{
										content: `${new Intl.NumberFormat('en-US').format(
											candidate.current_vote_power.toFixed(0)
										)}`,
										position: 'right',
										style: { 'background-color': '#1f2937', 'border-radius': '5px' },
										animation: 'puff'
									}}>-{candidate.vote_decay}%</td
								>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>

		{#if !loading}
			<!-- Vote button -->
			<div class="mt-5 flex justify-center">
				<button
					class="text-default rounded bg-purple-600 px-4 py-2 font-bold opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
					disabled={selectedCandidates.length === 0}
					on:click={onVote}
				>
					Vote
				</button>
			</div>
		{/if}
	</div>
</div>
<div class="left-side hidden md:flex">
	{#if $session}
		<VotedFor custodians={votedForCandidates} {staked} />
	{/if}
</div>
<div class="right-side hidden md:flex"></div>

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

	.vote1 {
		color: #69b34c;
	}
	.vote2 {
		color: #acb334;
	}
	.vote3 {
		color: #fab733;
	}
	.vote4 {
		color: #ff8e15;
	}
	.vote5 {
		color: #ff4e11;
	}
	.vote6 {
		color: #ff0d0d;
	}
</style>
