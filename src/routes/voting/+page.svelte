<script lang="ts">
	import PlanetMenu from '$lib/components/Menu/PlanetMenu.svelte';
	import VotedFor from '$lib/components/RightSide/VotedFor.svelte';
	import { AW, TOAST_TYPES } from '$lib/constants';
	import { activePlanet, session, toastStore } from '$lib/stores';
	import { voteDecayFormula } from '$lib/utils';
	import { pushActions } from '$lib/utils/wharfkit/session';
	import { Spinner } from 'flowbite-svelte';
	import { afterUpdate, onMount } from 'svelte';
	import CrownSolid from 'svelte-awesome-icons/CrownSolid.svelte';
	import ShareFromSquareRegular from 'svelte-awesome-icons/ShareFromSquareRegular.svelte';

	let candidates: any = [];
	let votedForCandidates: any = [];
	let maxvotes: any = 1;
	let selectedPlanet = $activePlanet;
	let loading = true;
	let selectedCandidates: any = [];

	onMount(async () => {
		await fetchCandidates($activePlanet);
		loading = false;
		await fetchDacglobals($activePlanet);

		if ($session) {
			await fetchVotedFor($activePlanet);
		}
	});

	afterUpdate(async () => {
		if (selectedPlanet !== $activePlanet) {
			selectedPlanet = $activePlanet;
			loading = true;
			selectedCandidates = [];
			await fetchCandidates($activePlanet);
			loading = false;
			await fetchDacglobals($activePlanet);

			if ($session) {
				await fetchVotedFor($activePlanet);
			}
		}
	});

	async function fetchCandidates(planet: any) {
		const response = await fetch(`/api/daoaw/candidates?activePlanet=${planet}`);
		candidates = await response.json();
	}

	async function fetchDacglobals(planet: any) {
		const response = await fetch(`/api/daoaw/dacglobals?activePlanet=${planet}`);
		const dacglobals = await response.json();
		maxvotes = dacglobals.find((dacglobal: any) => dacglobal.key === 'maxvotes').value[1] || 1;
	}

	async function fetchVotedFor(planet: any) {
		if ($session) {
			const response = await fetch(
				`/api/daoaw/votes?activePlanet=${planet}&voter=${$session?.actor}`
			);
			let data = await response.json();
			console.log(data);
			data = data.candidates.map((candidate: any) => {
				return candidates.find((c: any) => {
					return c.candidate_name === candidate;
				});
			});
			votedForCandidates = data.filter((candidate: any) => candidate !== undefined);
			console.log(votedForCandidates);
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
				account: AW.CONTRACT_NAME,
				name: AW.ACTIONS.VOTE_CUSTODIANS,
				authorization: [
					{
						actor: $session.actor,
						permission: 'active'
					}
				],
				data: {
					voter: $session.actor,
					dac_id: selectedPlanet.toLowerCase(),
					newvotes: selectedCandidates
				}
			}
		];
		await pushActions($session, actions);

		// await $session
		// 	.transact(
		// 		{
		// 			actions: [
		// 				{
		// 					account: AW.CONTRACT_NAME,
		// 					name: AW.ACTIONS.VOTE_CUSTODIANS,
		// 					authorization: [
		// 						{
		// 							actor: $session.actor,
		// 							permission: 'active'
		// 						}
		// 					],
		// 					data: {
		// 						voter: $session.actor,
		// 						dac_id: selectedPlanet.toLowerCase(),
		// 						newvotes: selectedCandidates
		// 					}
		// 				}
		// 			]
		// 		},
		// 		{
		// 			broadcast: true,
		// 			expireSeconds: 120
		// 		}
		// 	)
		// 	.then((res: any) => {
		// 		toastStore.add(
		// 			`<div>Executed: <a class="underline underline-offset-2" href="https://wax.bloks.io/transaction/${res.response.transaction_id}" target={"_blank"}>View Tx</a></div>`,
		// 			TOAST_TYPES.SUCCESS
		// 		);
		// 	})
		// 	.catch((error: any) => {
		// 		toastStore.add(error.message, TOAST_TYPES.ERROR);
		// 	});
	}
</script>

<div class="main-content py-6">
	<div class="container">
		<PlanetMenu />
		<table class="mt-5 w-full table-auto text-left text-2xl">
			<thead>
				<tr>
					<th>#</th>
					<th>Rank</th>
					<th>User</th>
					<th>Account</th>
					<th>Vote power</th>
					<th>Voters</th>
					<th>Vote Decay</th>
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
						<tr class={i % 2 === 0 ? 'bg-blue-900 bg-opacity-30' : ''}>
							<td>
								<input
									type="checkbox"
									class={`rounded-md ${$session === null ? 'cursor-not-allowed bg-gray-500' : ''}`}
									on:change={(e) => {
										selectCandidate(e);
									}}
									value={candidate.candidate_name}
									disabled={$session === null}
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
								<a href={`https://waxblock.io/account/${candidate.candidate_name}`} target="_blank"
									><ShareFromSquareRegular class="ml-2" color="white" /></a
								>
							</td>
							<td>{candidate.candidate_name}</td>
							<td>{new Intl.NumberFormat('en-US').format(candidate.total_vote_power.toFixed(0))}</td
							>
							<td>{candidate.number_voters}</td>
							<td
								>{(
									100 -
									(voteDecayFormula(candidate.avg_vote_time_stamp, candidate.total_vote_power) /
										candidate.total_vote_power) *
										100
								).toFixed(2)}</td
							>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
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
<div class="left-side">
	<!-- <Custodians custodians={candidates} /> -->
</div>
<div class="right-side">
	<VotedFor custodians={votedForCandidates} />
</div>

<style>
</style>
