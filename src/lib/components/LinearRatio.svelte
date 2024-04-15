<script lang="ts">
	import { BadgeCheckSolid } from 'flowbite-svelte-icons';

	export let items = [
		{ name: 'Yes', ratio: 10, color: 'green', selected: false },
		{ name: 'No', ratio: 30, color: 'red', selected: false },
		{ name: 'Abstain', ratio: 60, color: 'gray', selected: false }
	];

	// Calculate total to normalize ratios if they don't sum to 100
	$: total = items.reduce((acc, item) => acc + item.ratio, 0);
</script>

<div class="relative flex w-full overflow-hidden rounded-lg">
	{#each items as item}
		<div
			class={`flex  items-center justify-center px-2 py-0.5 
            text-xs font-bold text-white bg-${item.color}-500
             w-full overflow-hidden text-wrap opacity-80
             `}
		>
			<!-- style="width: {(item.ratio / total) * 100}%;" -->
			{#if item.selected}
				<BadgeCheckSolid class="mr-1 text-yellow-300 " size="lg" ariaLabel="Selected" />
			{/if}
			<div class="flex flex-col">
				<p>{item.name}</p>
				<p>{((item.ratio / total) * 100).toFixed(2)}%</p>
			</div>
		</div>
	{/each}
</div>

<style>
	/* Ensure text is visible and adjusts based on segment size */
	.flex div {
		transition: width 0.3s ease;
	}
</style>
