<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ROUTES from '$lib/routes';
	import { AngleDownOutline, AngleRightOutline } from 'flowbite-svelte-icons';
	import BarsSolid from 'svelte-awesome-icons/BarsSolid.svelte';
	import { slide } from 'svelte/transition';

	let isOpen = false; // State to track if the hamburger menu is open
	$: activeUrl = $page.url.pathname; // Reactive variable to track the active URL
	let expandedGroup: any = null;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	on:click={() => (isOpen = false)}
	class:fixed={isOpen}
	class:inset-0={isOpen}
	class:pt-1={isOpen}
	class="md:relative"
>
	<nav class="text-default mr-5 py-2">
		<div class="flex items-center justify-between">
			<button class="ml-5 md:hidden" on:click|stopPropagation={() => (isOpen = !isOpen)}>
				<BarsSolid class="pointer-events-none" />
			</button>

			{#if isOpen}
				<!-- Mobile Menu -->
				<div
					in:slide={{ axis: 'x', delay: 0, duration: 250 }}
					out:slide={{ axis: 'x', delay: 0, duration: 250 }}
					class={isOpen
						? 'fixed bottom-0 left-0 top-12 w-48 border-r border-gray-600 bg-background-default shadow-lg  md:hidden'
						: 'hidden'}
					on:click|stopPropagation={() => {}}
				>
					<ul class="m-0 list-none divide-y divide-dashed p-0">
						{#each ROUTES as route}
							<li class="block">
								{#if route.group}
									<div
										class={`cursor-pointer px-4 py-2 ${
											activeUrl.includes(route.path) ? 'font-semibold text-orange-500 ' : ''
										}`}
										on:click={() =>
											(expandedGroup = expandedGroup === route.path ? null : route.path)}
									>
										{route.name}
										{#if expandedGroup === route.path}
											<AngleDownOutline class="ml-2 inline-block" size="sm" />
										{:else}
											<AngleRightOutline class="ml-2 inline-block" size="sm" />
										{/if}
									</div>
									{#if expandedGroup === route.path}
										<div class=" mx-3 rounded-lg bg-background-default shadow-md">
											{#each route.group as groupItem}
												<div
													on:click|stopPropagation={() => {
														isOpen = false;
														goto(groupItem.path);
													}}
													class={` cursor-pointer rounded-lg px-4 py-2 ${
														activeUrl === groupItem.path
															? 'font-semibold text-orange-500 backdrop-brightness-200'
															: ''
													}`}
												>
													{groupItem.name}
												</div>
											{/each}
										</div>
									{/if}
								{:else}
									<div
										on:click|stopPropagation={() => {
											isOpen = false;
											goto(route.path);
										}}
										class={`cursor-pointer px-4 py-2 ${
											activeUrl.includes(route.path)
												? 'font-semibold text-orange-500 backdrop-brightness-200'
												: ''
										}`}
									>
										{route.name}
									</div>
								{/if}
							</li>
						{/each}
					</ul>
				</div>
			{:else}
				<div class="hidden rounded-xl border border-indigo-500 p-2 md:flex">
					{#each ROUTES as route}
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<div class="nav-item" on:mouseenter={() => {}} on:mouseleave={() => {}}>
							{#if route.group}
								<div
									class={(activeUrl.includes(route.path) ? 'px-4 text-orange-500 ' : 'px-4') +
										' cursor-pointer'}
								>
									{route.name}
									{#if route.group}
										<AngleDownOutline class="inline-block" size="sm" />
									{/if}
								</div>
							{:else}
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<div
									class={(activeUrl.includes(route.path) ? 'px-4 text-orange-500 ' : 'px-4') +
										' cursor-pointer'}
									on:click|stopPropagation={() => goto(route.path)}
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
											on:click|stopPropagation={() => goto(groupItem.path)}
											class={`dropdown-item cursor-pointer rounded-lg px-4 ${
												activeUrl === groupItem.path ? 'px-4 text-orange-500 ' : 'px-4'
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
		</div>
	</nav>
</div>

<style>
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
