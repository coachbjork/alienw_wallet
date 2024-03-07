<!-- src/lib/components/Toast.svelte -->
<script lang="ts">
	import { TOAST_TYPES } from '$lib/constants';
	import { toastStore } from '$lib/stores/toast';
	import { Toast } from 'flowbite-svelte';
	import {
		InfoCircleSolid,
		ShieldSolid,
		ThumbsDownSolid,
		ThumbsUpSolid
	} from 'flowbite-svelte-icons';
	import { slide } from 'svelte/transition';

	$: if ($toastStore.length > 0) {
		$toastStore.forEach((toast: any) => {
			if (toast.counter < 5) return;
			trigger(toast);
		});
	}

	function trigger(toast: any) {
		timeout(toast);
	}

	async function timeout(toast: any) {
		if (toast.counter > 0) {
			let newToast = { ...toast };
			newToast.counter = newToast.counter - 1;
			toastStore.set(newToast.id, newToast.counter);
			return setTimeout(() => timeout(newToast), 1000);
		}
		toastStore.set(toast.id, 0, false);

		await setTimeout(() => toastStore.remove(toast.id), 500);
	}

	async function onClose(toast: any) {
		toastStore.set(toast.id, 0, false);

		await setTimeout(() => toastStore.remove(toast.id), 500);
	}
</script>

<div class="toast flex flex-col">
	{#each $toastStore as toast}
		{#if toast.type === TOAST_TYPES.SUCCESS}
			<Toast
				dismissable={true}
				transition={slide}
				params={{ delay: 250, duration: 500 }}
				bind:open={toast.open}
				color="green"
				divClass="w-full max-w-xs min-w-64 p-2 text-white bg-green-500 gap-2 "
				on:close={() => onClose(toast)}
			>
				<ThumbsUpSolid slot="icon" class="h-4 w-4" />
				{@html toast.message}
			</Toast>
		{:else if toast.type === TOAST_TYPES.ERROR}
			<Toast
				dismissable={true}
				transition={slide}
				params={{ delay: 250, duration: 500 }}
				bind:open={toast.open}
				color="red"
				divClass="w-full max-w-xs min-w-64 p-2 text-white bg-red-500 gap-2 "
				on:close={() => onClose(toast)}
			>
				<ThumbsDownSolid slot="icon" class="h-4 w-4" />
				{@html toast.message}
			</Toast>
		{:else if toast.type === TOAST_TYPES.WARNING}
			<Toast
				dismissable={true}
				transition={slide}
				params={{ delay: 250, duration: 500 }}
				bind:open={toast.open}
				color="yellow"
				divClass="w-full max-w-xs min-w-64 p-2 text-white bg-yellow-400 gap-2 "
				on:close={() => onClose(toast)}
			>
				<ShieldSolid slot="icon" class="h-4 w-4" />
				{@html toast.message}
			</Toast>
		{:else if toast.type === TOAST_TYPES.INFO}
			<Toast
				dismissable={true}
				transition={slide}
				params={{ delay: 250, duration: 500 }}
				bind:open={toast.open}
				color="blue"
				divClass="w-full max-w-xs min-w-64 p-2 text-white bg-blue-500 gap-2 "
				on:close={() => onClose(toast)}
			>
				<InfoCircleSolid slot="icon" class="h-4 w-4" />
				{@html toast.message}
			</Toast>
		{/if}
	{/each}
</div>

<style>
	.toast {
		z-index: 1000;
		gap: 5px;
		position: fixed;
		top: 15px;
		right: 2%;
	}
</style>
