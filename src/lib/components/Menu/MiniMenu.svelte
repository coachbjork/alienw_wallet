<script lang="ts">
	import { afterUpdate, createEventDispatcher, onMount } from 'svelte';
	import BarsSolid from 'svelte-awesome-icons/BarsSolid.svelte';
	import { slide } from 'svelte/transition';

	export let isOpen = false;
	let className;
	export { className as class };
	export let menuItems: any = [];
	const dispatch = createEventDispatcher();
	let selectedId: any = null;

	onMount(async () => {
		selectedId = menuItems[0].id;
	});

	afterUpdate(async () => {});

	function toggleOpen() {
		isOpen = !isOpen;
	}

	function selectedItem(item: any) {
		selectedId = item.id;
		dispatch('selectedItem', item);
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class={className}>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<p class="hidden text-center text-2xl underline underline-offset-4 md:block">Wallet Menu</p>
	<!-- Mobile view: Toggle button -->
	<button
		class="absolute right-3 top-1 flex flex-row items-center md:hidden"
		on:click|stopPropagation={toggleOpen}
	>
		<BarsSolid class="pointer-events-none h-5 w-5" />
		<span class="ml-1">Wallet Menu</span>
	</button>
	{#if isOpen}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			class="md:relative"
			class:fixed={isOpen}
			class:inset-0={isOpen}
			on:click={() => (isOpen = false)}
		>
			<div
				class="fixed left-0 top-[58px] h-full w-48 cursor-pointer border-r border-gray-600 bg-background-default shadow-lg"
				on:click|stopPropagation={() => {}}
			>
				<ul
					in:slide={{ axis: 'x', delay: 0, duration: 350 }}
					out:slide={{ axis: 'x', delay: 0, duration: 450 }}
					class={isOpen ? 'list-none  md:hidden' : 'hidden'}
				>
					{#each menuItems as { id, icon: Icon, label, logMessage }}
						<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
						<li
							class="flex flex-row items-center border-r-2 px-4 py-2 hover:border-indigo-500 hover:font-bold"
							class:border-indigo-500={selectedId === id}
							class:font-bold={selectedId === id}
							on:click={() => {
								selectedItem({ id, label });
								isOpen = false;
							}}
						>
							<svelte:component this={Icon} />
							<div class="ml-2">{label}</div>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	{/if}

	<div class="mt-5 hidden cursor-pointer p-2 md:flex">
		<ul class="w-full list-none">
			{#each menuItems as { id, icon: Icon, label, logMessage }}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
				<li
					class="flex flex-row items-center border-r-2 px-4 py-2 hover:border-indigo-500 hover:font-bold"
					class:border-indigo-500={selectedId === id}
					class:font-bold={selectedId === id}
					on:click={() => {
						selectedItem({ id, label });
					}}
				>
					<svelte:component this={Icon} />
					<div class="ml-2">{label}</div>
				</li>
			{/each}
		</ul>
	</div>
</div>

<style>
</style>
