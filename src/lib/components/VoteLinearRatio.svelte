<script lang="ts">
	import { AW_REFERENDUM } from '$lib/constants';
	import { BadgeCheckSolid } from 'flowbite-svelte-icons';
	import { createEventDispatcher } from 'svelte';

	export let items = [
		{ name: 'Yes', value: 10, color: 'green', selected: false, vote_type: 'yes' },
		{ name: 'No', value: 30, color: 'red', selected: false, vote_type: 'no' },
		{ name: 'Abstain', value: 60, color: 'gray', selected: false, vote_type: 'abstain' }
	];
	export let referendum_id = 0;
	const dispatch = createEventDispatcher();

	// Calculate total to normalize ratios if they don't sum to 100
	$: total = items.reduce((acc, item) => acc + item.value, 0);

	function onVote(item: any) {
		let data = {
			referendum_id,
			vote_type: !item.selected ? item.vote_type : AW_REFERENDUM.VOTE.REMOVE.value
		};

		dispatch('onVote', data);
	}
</script>

<div class="relative flex flex-col overflow-hidden rounded-lg">
	<!-- Total vote -->
	<div
		class=" flex w-full items-center justify-center bg-gray-800
		 bg-opacity-80 px-2 py-0.5 text-sm text-white md:text-base"
	>
		<p>Total Vote {total}</p>
	</div>
	<div class="flex flex-col md:flex-row">
		{#each items as item}
			<button
				class={`flex  items-center justify-center px-2 py-0.5 
            text-sm font-bold text-white md:text-base bg-${item.color}-500
             w-full overflow-hidden text-wrap opacity-80 hover:opacity-100
             `}
				on:click={() => {
					onVote(item);
				}}
			>
				{#if item.selected}
					<BadgeCheckSolid class="mr-1 text-yellow-300 " size="lg" ariaLabel="Selected" />
				{/if}
				<div class="flex flex-col">
					<p>{item.name}</p>
					<p>{((total != 0 ? item.value / total : 0) * 100).toFixed(2)}%</p>
					<p class="text-sm italic md:text-base">({item.value})</p>
				</div>
			</button>
		{/each}
	</div>
</div>

<style>
	/* Ensure text is visible and adjusts based on segment size */
	.flex div {
		transition: width 0.3s ease;
	}
</style>
