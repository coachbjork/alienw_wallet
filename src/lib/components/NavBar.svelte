<script lang="ts">
	import { page } from '$app/stores';
	import BarsSolid from 'svelte-awesome-icons/BarsSolid.svelte';
	let isOpen = false; // State to track if the hamburger menu is open
	$: activeUrl = $page.url.pathname; // Reactive variable to track the active URL
</script>

<nav class="mr-5 py-2 text-white">
	<div class="flex items-center justify-between">
		<button class="md:hidden" on:click={() => (isOpen = !isOpen)}>
			<!-- Hamburger Icon -->
			<BarsSolid />
		</button>
		<div class="hidden rounded-xl border border-indigo-500 p-2 md:flex">
			<a href="/" class={activeUrl === '/' ? 'active' : ''}>Home</a>
			<a href="/voting" class={activeUrl === '/voting' ? 'active ml-4' : 'ml-4'}>Voting</a>
			<!-- Add more links here -->
		</div>
	</div>
	{#if isOpen}
		<!-- Mobile Menu -->
		<div
			class=" absolute right-0 top-full w-full rounded-xl border border-indigo-500 bg-background-default md:hidden"
		>
			<a href="/" class={activeUrl === '/' ? 'active block p-4' : 'block p-4'}>Home</a>
			<a href="/voting" class={activeUrl === '/voting' ? 'active block p-4' : 'block p-4'}>Voting</a
			>
			<!-- Add more links here -->
		</div>
	{/if}
</nav>

<style>
	.active {
		color: #e46414; /* Active link color */
	}
</style>
