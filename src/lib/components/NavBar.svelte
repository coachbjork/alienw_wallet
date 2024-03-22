<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { ROUTES } from '$lib/constants';
	import { AngleDownOutline } from 'flowbite-svelte-icons';
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
				<!-- <a href={route.path} class={activeUrl === route.path ? 'active px-4' : 'px-4'}
					>{route.name}</a
				> -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div class="nav-item" on:mouseenter={() => {}} on:mouseleave={() => {}}>
					{#if route.group}
						<div
							class={(activeUrl.includes(route.path) ? 'active px-4' : 'px-4') + ' cursor-pointer'}
						>
							{route.name}
							{#if route.group}
								<AngleDownOutline class="inline-block" size="sm" />
							{/if}
						</div>
					{:else}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<div
							class={(activeUrl.includes(route.path) ? 'active px-4' : 'px-4') + ' cursor-pointer'}
							on:click={() => goto(route.path)}
						>
							{route.name}
							{#if route.group}
								<AngleDownOutline class="inline-block" size="sm" />
							{/if}
						</div>
					{/if}

					{#if route.group}
						<div class="dropdown-content ml-3 rounded-lg bg-background-default">
							{#each route.group as groupItem}
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<div
									on:click={() => goto(groupItem.path)}
									class={`dropdown-item cursor-pointer rounded-lg px-4 ${
										activeUrl === groupItem.path ? 'active px-4' : 'px-4'
									}`}
								>
									{groupItem.name}
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
	{#if isOpen}
		<!-- Mobile Menu -->
		<div
			class=" absolute right-0 top-full w-full rounded-xl border border-indigo-500 bg-background-default md:hidden"
		>
			{#each ROUTES as route}
				<!-- <a href={route.path} class={activeUrl === route.path ? 'active block px-4' : ' block px-4'}
					>{route.name}</a
				> -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div class="nav-item" on:mouseenter={() => {}} on:mouseleave={() => {}}>
					<!-- Arrow down icon -->
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					{#if route.group}
						<div
							class={(activeUrl.includes(route.path) ? 'active px-4' : 'px-4') + ' cursor-pointer'}
						>
							{route.name}
							{#if route.group}
								<AngleDownOutline class="inline-block" size="sm" />
							{/if}
						</div>
					{:else}
						<div
							on:click={() => goto(route.path)}
							class={(activeUrl.includes(route.path) ? 'active px-4' : 'px-4') + ' cursor-pointer'}
						>
							{route.name}
						</div>
					{/if}

					{#if route.group}
						<div class="dropdown-content ml-3 rounded-lg bg-background-default">
							{#each route.group as groupItem}
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<div
									on:click={() => goto(groupItem.path)}
									class={`dropdown-item cursor-pointer rounded-lg px-4 ${
										activeUrl === groupItem.path ? 'active px-4' : 'px-4'
									}`}
								>
									{groupItem.name}
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</nav>

<style>
	.active {
		color: #e46414; /* Active link color */
	}
	.nav-item {
		position: relative;
		/* display: inline-block; */
	}
	.dropdown-content {
		display: none;
		position: absolute;
		box-shadow: 0px 8px 16px 0px rgba(114, 112, 207, 0.2);
		padding: 12px 16px;
		z-index: 1;
	}
	.dropdown-item {
		display: block; /* Ensure each dropdown item is on its own row */
		padding: 8px 12px; /* Adjust padding as needed */
	}
	.dropdown-item:hover {
		background-color: #0e1636; /* Optional: change background on hover */
	}
	.nav-item:hover .dropdown-content {
		display: block;
	}
</style>
