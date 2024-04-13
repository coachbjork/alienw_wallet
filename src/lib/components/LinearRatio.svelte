<script lang="ts">
	export let items = [
		{ name: 'Yes', ratio: 10, color: 'green' },
		{ name: 'No', ratio: 30, color: 'red' },
		{ name: 'Abstain', ratio: 60, color: 'gray' }
	];

	// Calculate total to normalize ratios if they don't sum to 100
	$: total = items.reduce((acc, item) => acc + item.ratio, 0);
</script>

<div class="relative flex w-full overflow-hidden rounded-lg">
	{#each items as item}
		<div
			class={`flex items-center justify-center px-2 py-0.5 
            text-xs font-bold text-white bg-${item.color}-500
             overflow-hidden
             text-wrap
             `}
			style="width: {(item.ratio / total) * 100}%;"
		>
			{item.name}
			{((item.ratio / total) * 100).toFixed(2)}%
		</div>
	{/each}
</div>

<style>
	/* Ensure text is visible and adjusts based on segment size */
	.flex div {
		transition: width 0.3s ease;
	}
</style>
