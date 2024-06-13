<script lang="ts">
	import { page } from '$app/stores';
	import { activePlanetStore, awSummaryStore } from '$lib/stores';

	let className;
	export { className as class };

	let planet_balance = 0;
	$: $awSummaryStore &&
		(planet_balance =
			$awSummaryStore?.planet_balances[$activePlanetStore.scope][$activePlanetStore.account]?.TLM ||
			0);
</script>

<div class={className}>
	{#if $page.url.pathname !== '/wallet'}
		<!-- display planet balance with logo, name, balance -->
		<div class="flex items-center">
			<img src={`/images/planets/${$activePlanetStore.scope}.png`} alt="planet" class="h-10 w-10" />
			<div class="ml-1 hidden font-bold md:flex">{$activePlanetStore.name}:</div>
			<div class="ml-1">
				{planet_balance}
				<span class="font-bold">TLM</span>
			</div>
			<!-- <div class="ml-2 text-lg font-bold">{awSummaryStore.balance}</div> -->
		</div>
	{/if}
</div>

<style>
	/* Add your component styles here */
</style>
