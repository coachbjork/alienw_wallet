<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import { awSummaryStore } from '$lib/stores';
	import { onMount } from 'svelte';
	import '../app.css';

	onMount(async () => {
		await awSummaryStore.fetch();
	});

	// $: console.log($awSummaryStore);
</script>

<div class="fullpage slashed-zero antialiased">
	<Header />
	<Toast />
	<slot />
</div>
