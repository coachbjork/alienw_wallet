<script lang="ts">
	import { PUBLIC_ALIEN_WALLET_API } from '$env/static/public';
	import { activePlanetStore } from '$lib/stores';
	import type { Planet } from '$lib/types';
	import { tooltip } from '@svelte-plugins/tooltips';
	import axios from 'axios';
	import { Spinner } from 'flowbite-svelte';
	import moment from 'moment';
	import { afterUpdate, onMount } from 'svelte';
	import ShareFromSquareRegular from 'svelte-awesome-icons/ShareFromSquareRegular.svelte';

	let searchQuery: string = '';
	let voterDetails: any = [];
	let filteredVoterDetails: any = [];
	let selectedPlanet: Planet = $activePlanetStore;
	let loading = true;
	let staked: string = '';
	const className = '';
	export { className as class };

	onMount(async () => {
		Promise.all([fetchVoterDetails()]).then(() => {
			loading = false;
		});
	});

	afterUpdate(async () => {
		if (selectedPlanet !== $activePlanetStore) {
			selectedPlanet = $activePlanetStore;
			await refresh();
		}
	});

	$: filteredVoterDetails = voterDetails
		.filter((voter: any) => {
			if (!searchQuery) return true;
			return voter.candidates.toLowerCase().includes(searchQuery.toLowerCase());
		})
		.slice(0, 100);

	async function refresh() {
		loading = true;
		staked = '';
		Promise.all([fetchVoterDetails()]).then(() => {
			loading = false;
		});
	}

	async function fetchVoterDetails() {
		try {
			let api_response: any = await axios.get(
				`${PUBLIC_ALIEN_WALLET_API}/votes/${$activePlanetStore.scope}`
			);
			if (!api_response) return;
			let { data } = api_response;
			// console.log(data);
			if (data && data.length > 0) {
				// sort by vote power
				data = data.sort((a: any, b: any) => b.vote_power - a.vote_power);
				// calculate vote decay
				data = data.map((voter: any) => {
					if (!voter.vote_power) voter.vote_power = 0;
					if (!voter.decay) voter.decay = 0;
					if (!voter.staked) voter.staked = 0;
					voter.candidates = voter.candidates.join(', ');
					voter.vote_decay = (((voter.vote_power - voter.decay) / voter.vote_power) * 100).toFixed(
						2
					);
					return voter;
				});
				voterDetails = data;
				// split to top 100
				data = data.slice(0, 100);
				filteredVoterDetails = data;
			}
		} catch (error) {
			console.error(error);
		}
	}
</script>

<div class={className}>
	<div class="mb-5 mt-10 flex justify-center">
		<div class="hidden md:flex md:basis-1/3"></div>
		<h1 class="grow justify-center text-center text-2xl font-bold text-orange-500 md:ml-0">
			Voters Breakdown
		</h1>
		<input
			type="text"
			class="mr-4 basis-1/3 justify-end rounded-md border border-gray-500 p-2 text-black focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
			placeholder="Search by candidate"
			bind:value={searchQuery}
		/>
	</div>
	<div class="overflow-x-auto">
		<table class="text-default w-full table-auto text-left text-lg md:text-xl">
			<thead>
				<tr>
					<th>#</th>
					<th>Voter</th>
					<th>Candidates</th>
					<th>Vote Power</th>
					<th>Vote Decay</th>
					<th>Stake</th>
					<th>Time</th>
					<th>Last Vote</th>
				</tr>
			</thead>
			<tbody class="text-nowrap text-sm md:text-base">
				{#if loading}
					<tr>
						<td colspan="8" class="text-center">
							<Spinner color="purple" />
						</td>
					</tr>
				{:else if filteredVoterDetails.length > 0}
					{#each filteredVoterDetails as voter, i}
						<tr class="odd:backdrop-brightness-150">
							<td>
								{i + 1}
							</td>
							<td class="flex items-center"
								>{voter._id}
								<a href={`https://waxblock.io/account/${voter._id}`} target="_blank"
									><ShareFromSquareRegular class="ml-2" /></a
								>
							</td>
							<td>{voter.candidates}</td>
							<td>{new Intl.NumberFormat('en-US').format(voter.vote_power.toFixed(2))}</td>
							<td
								class={` ${
									voter.vote_decay > 50
										? 'vote6'
										: voter.vote_decay > 40
											? 'vote5'
											: voter.vote_decay > 30
												? 'vote4'
												: voter.vote_decay > 20
													? 'vote3'
													: voter.vote_decay > 10
														? 'vote2'
														: voter.vote_decay > 0
															? 'vote1'
															: ''
								}`}
								use:tooltip={{
									content: `${new Intl.NumberFormat('en-US').format(voter.decay.toFixed(2))}`,
									position: 'right',
									style: { 'background-color': '#1f2937', 'border-radius': '5px' },
									animation: 'puff'
								}}>-{voter.vote_decay}%</td
							>
							<!-- TODO: fix tooltip position bugs -->
							<td>{new Intl.NumberFormat('en-US').format(voter.staked.toFixed(0))}</td>
							<td>{`${voter.stake_time / (60 * 60 * 24)} Days`}</td>
							<td>{moment(voter.vote_date).format('YYYY-MM-DD')}</td>
						</tr>
					{/each}
				{:else}
					<tr>
						<td colspan="8" class="text-center">No data available</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>

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
