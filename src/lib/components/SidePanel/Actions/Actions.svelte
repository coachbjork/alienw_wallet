<script lang="ts">
	import { CommandOutline } from 'flowbite-svelte-icons';
	import { afterUpdate, onMount } from 'svelte';

	export let showActions = false;

	onMount(async () => {});

	afterUpdate(async () => {});

	function toggleActions() {
		showActions = !showActions;
	}
</script>

<div class="fixed bottom-0 left-0 right-0 flex flex-col md:relative">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<p class="hidden text-center text-2xl underline underline-offset-4 md:block">Actions</p>
	<!-- Mobile view: Toggle button -->
	<button
		class="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full border-2 border-blue-500 bg-yellow-400 text-white shadow-inner hover:bg-yellow-500 md:hidden"
		on:click={toggleActions}
	>
		<CommandOutline class="pointer-events-none h-8 w-8" />
	</button>
	<slot />
</div>

<style>
</style>
