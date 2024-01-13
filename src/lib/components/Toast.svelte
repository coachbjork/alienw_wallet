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
		toastStore.remove(toast.id);
	}
</script>

<div class="toast flex flex-col">
	{#each $toastStore as toast}
		{#if toast.type === TOAST_TYPES.SUCCESS}
			<button transition:slide={{ delay: 250, duration: 300 }}>
				<Toast
					dismissable={true}
					transition={slide}
					bind:open={toast.open}
					color="green"
					divClass="w-full max-w-xs min-w-64 p-4 text-white bg-green-500 gap-3 break-all"
					on:close={() => toastStore.remove(toast.id)}
				>
					<ThumbsUpSolid slot="icon" class="h-4 w-4" />

					{toast.message}
				</Toast>
			</button>
		{:else if toast.type === TOAST_TYPES.ERROR}
			<button transition:slide={{ delay: 250, duration: 300 }}>
				<Toast
					dismissable={true}
					transition={slide}
					bind:open={toast.open}
					color="red"
					divClass="w-full max-w-xs min-w-64 p-4 text-white bg-red-500 gap-3 break-all"
					on:close={() => toastStore.remove(toast.id)}
				>
					<ThumbsDownSolid slot="icon" class="h-4 w-4" />
					{toast.message}
				</Toast>
			</button>
		{:else if toast.type === TOAST_TYPES.WARNING}
			<button transition:slide={{ delay: 250, duration: 300 }}>
				<Toast
					dismissable={true}
					transition={slide}
					bind:open={toast.open}
					color="yellow"
					divClass="w-full max-w-xs min-w-64 p-4 text-white bg-yellow-400 gap-3 break-all"
					on:close={() => toastStore.remove(toast.id)}
				>
					<ShieldSolid slot="icon" class="h-4 w-4" />
					{toast.message}
				</Toast>
			</button>
		{:else if toast.type === TOAST_TYPES.INFO}
			<button transition:slide={{ delay: 250, duration: 300 }}>
				<Toast
					dismissable={true}
					transition={slide}
					bind:open={toast.open}
					color="blue"
					divClass="w-full max-w-xs min-w-64 p-4 text-white bg-blue-500 gap-3 break-all"
					on:close={() => toastStore.remove(toast.id)}
				>
					<InfoCircleSolid slot="icon" class="h-4 w-4" />
					{toast.message}
				</Toast>
			</button>
		{/if}
	{/each}
</div>

<style>
	.toast {
		z-index: 1000;
		gap: 10px;
		position: fixed;
		top: 0;
		right: 0;
		padding: 10px;
	}
</style>
