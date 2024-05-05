<script lang="ts">
	import { browser } from '$app/environment';
	import { AW_PLANETS } from '$lib/constants';
	import { get_custodians } from '$lib/services/awdaoService';
	import { activePlanetStore, custodiansStore } from '$lib/stores';
	import type { Planet } from '$lib/types';
	import { onMount } from 'svelte';

	if (browser) {
		onMount(async () => {
			if (!$activePlanetStore) {
				activePlanetStore.set(AW_PLANETS[0]);
				const custodiansData = await get_custodians(AW_PLANETS[0].name);
				custodiansStore.set(custodiansData);
			} else {
				const custodiansData = await get_custodians($activePlanetStore.name);
				custodiansStore.set(custodiansData);
			}
		});
	}

	function handleClick(planet: Planet) {
		return async () => {
			activePlanetStore.set(planet);
			// await tick();
			const custodiansData = await get_custodians(planet.name);
			custodiansStore.set(custodiansData);
		};
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="planet_menu mx-5 rounded-xl border border-indigo-500">
	<ul>
		{#each AW_PLANETS as planet}
			<li class={$activePlanetStore.name === planet.name ? 'active' : ''}>
				<span class="text-default" on:click={handleClick(planet)}>{planet.name}</span>
			</li>
		{/each}
	</ul>
</div>

<style>
	.planet_menu {
		box-sizing: border-box;
		-moz-box-sizing: border-box;
		-webkit-box-sizing: border-box;
		margin-top: 20px;
		max-width: 100vw;
	}

	.planet_menu ul {
		flex-direction: row;
		align-items: flex-start;
		flex-wrap: wrap;
		display: flex;
		padding: 5px;
		margin: 0;
		gap: 20px;
		justify-content: center;
	}

	.planet_menu li {
		display: block;
		text-decoration: none;
		padding: 5px;
		justify-content: space-evenly;
		margin: auto;
	}

	.planet_menu span {
		text-decoration: none;
		padding: 10px;
		font-size: 20px;
	}

	.planet_menu ul > li.active {
		border-bottom: 1px solid rgb(221, 244, 248, 0.2);
		text-shadow:
			0 0 20px rgb(165, 236, 248),
			0 0 30px rgb(165, 236, 248),
			0 0 50px rgb(165, 236, 248);
		font-weight: 700;
	}

	span:hover {
		cursor: pointer;
		text-decoration: none;
		text-shadow:
			0 0 20px rgb(165, 236, 248),
			0 0 30px rgb(165, 236, 248),
			0 0 50px rgb(165, 236, 248);
	}
</style>
