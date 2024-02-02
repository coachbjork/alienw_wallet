<script lang="ts">
	import { page } from '$app/stores';
	import { ROUTES } from '$lib/constants';
	import BarsSolid from 'svelte-awesome-icons/BarsSolid.svelte';

	let isOpen = false; // State to track if the hamburger menu is open
	$: activeUrl = $page.url.pathname; // Reactive variable to track the active URL
</script>

<nav class="text-default mr-5 py-2">
	<div class="flex items-center justify-between">
		<button class="md:hidden" on:click={() => (isOpen = !isOpen)}>
			<BarsSolid />
		</button>
		<div class="hidden rounded-xl border border-indigo-500 p-2 md:flex">
			{#each ROUTES as route}
				<a href={route.path} class={activeUrl === route.path ? 'active px-4' : 'px-4'}
					>{route.name}</a
				>
			{/each}
		</div>
	</div>
	{#if isOpen}
		<!-- Mobile Menu -->
		<div
			class=" absolute right-0 top-full w-full rounded-xl border border-indigo-500 bg-background-default md:hidden"
		>
			{#each ROUTES as route}
				<a href={route.path} class={activeUrl === route.path ? 'active block px-4' : ' block px-4'}
					>{route.name}</a
				>
			{/each}
		</div>
	{/if}
</nav>

<style>
	.active {
		color: #e46414; /* Active link color */
	}
</style>
