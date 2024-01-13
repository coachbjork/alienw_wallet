<script lang="ts">
	import PlanetMenu from '$lib/components/Menu/PlanetMenu.svelte';
	import { TOAST_TYPES } from '$lib/constants';
	import { activePlanet } from '$lib/stores';
	import { toastStore } from '$lib/stores/toast';
	import { voteDecayFormula } from '$lib/utils';
	import { Spinner } from 'flowbite-svelte';
	import { afterUpdate, onMount } from 'svelte';

	let candidates: any = [];
	let selectedPlanet = $activePlanet;
	let loading = true;
	let selectedCandidates: any = [];

	onMount(async () => {
		await fetchCandidates($activePlanet);
		loading = false;
		toastStore.add(
			'SuccesSuccesSuccesSuccesSuccesSuccesSuccesSuccesSuccesSuccesSucces',
			TOAST_TYPES.SUCCESS
		);
		toastStore.add('Warning', TOAST_TYPES.WARNING);
		toastStore.add('Info', TOAST_TYPES.INFO);
		toastStore.add('Error', TOAST_TYPES.ERROR);
	});

	afterUpdate(async () => {
		if (selectedPlanet !== $activePlanet) {
			selectedPlanet = $activePlanet;
			loading = true;
			await fetchCandidates($activePlanet);
			loading = false;
		}
	});

	async function fetchCandidates(planet: any) {
		const response = await fetch(`/api/candidates?activePlanet=${planet}`);
		const data = await response.json();
		candidates = data.candidates;
		console.log('data', data);
	}

	function selectCandidate(e: any) {
		const { checked, value } = e.target;
		if (selectedCandidates.length == 2 && checked) {
			toastStore.add('Max 2 candidates');
			e.target.checked = false;
			return;
		}
		if (checked) {
			selectedCandidates.push(value);
		} else {
			selectedCandidates = selectedCandidates.filter((candidate: any) => candidate !== value);
		}
		console.log('selectedCandidates', selectedCandidates);
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
					<tr>
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
						<td>{i + 1}</td>
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
</div>

<style>
</style>
