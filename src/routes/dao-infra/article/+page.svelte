<script lang="ts">
	import PlanetMenu from '$lib/components/Menu/PlanetMenu.svelte';
	import { activePlanetStore, session } from '$lib/stores';
	import type { Planet } from '$lib/types';
	import { afterUpdate, onMount } from 'svelte';

	let selectedPlanet: Planet = $activePlanetStore;
	let loading = true;

	onMount(async () => {
		loading = false;

		if ($session) {
		}
	});

	afterUpdate(async () => {
		if (selectedPlanet !== $activePlanetStore) {
			selectedPlanet = $activePlanetStore;
			loading = true;
			loading = false;
		}
	});
</script>

<div class="main-content py-6">
	<div class="container">
		<PlanetMenu />
	</div>
</div>
<div class="left-side"></div>
<div class="right-side"></div>

<style>
</style>
