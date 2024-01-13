<script lang="ts">
	import PlanetMenu from '$lib/components/Menu/PlanetMenu.svelte';
	import { TOAST_TYPES } from '$lib/constants';
	import { activePlanet } from '$lib/stores';
	import { toastStore } from '$lib/stores/toast';
	import { voteDecayFormula } from '$lib/utils';
	import { Spinner } from 'flowbite-svelte';
	import { afterUpdate, onMount } from 'svelte';
	import CrownSolid from 'svelte-awesome-icons/CrownSolid.svelte';

	let candidates: any = [];
	let maxvotes: any = 1;
	let selectedPlanet = $activePlanet;
	let loading = true;
	let selectedCandidates: any = [];

	onMount(async () => {
		await fetchCandidates($activePlanet);
		loading = false;
		await fetchDacglobals($activePlanet);
	});

	afterUpdate(async () => {
		if (selectedPlanet !== $activePlanet) {
			selectedPlanet = $activePlanet;
			loading = true;
			selectedCandidates = [];
			await fetchCandidates($activePlanet);
			loading = false;
			await fetchDacglobals($activePlanet);
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
</script>

<!-- {% set vote_decay = ((voter['vote_power'] - voter['decay']) / voter['vote_power'] * 100)|default(0) %} -->
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
								class="rounded-md"
								on:change={(e) => {
									selectCandidate(e);
								}}
								value={candidate.candidate_name}
							/>
						</td>
						<td>
							{#if i <= 4}
								<CrownSolid color="white" />
							{:else}
								{i + 1}
							{/if}</td
						>
						<td>{candidate.name}</td>
						<td>{candidate.candidate_name}</td>
						<td>{new Intl.NumberFormat('en-US').format(candidate.total_vote_power.toFixed(0))}</td>
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
				on:click={() => {
					console.log(selectedCandidates);
				}}
			>
				Vote
			</button>
		</div>
	{/if}
</div>

<style>
</style>
