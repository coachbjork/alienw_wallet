<script lang="ts">
	import '../app.css';

	import Header from '$lib/components/Header.svelte';
	import Toast from '$lib/components/Toast.svelte';
	// import { bpRPCStore } from '$lib/stores';
	// import { onMount } from 'svelte';

	// onMount(() => {
	// 	console.log('layout mounted');
	// 	// load local storage and update setting store
	// 	const stored = window.localStorage.getItem('bpRPCStore');
	// 	console.log('stored@', stored);
	// 	if (stored) {
	// 		console.log('stored@set', stored);
	// 		bpRPCStore.set(stored);
	// 	}
	// });
</script>

<div class="fullpage">
	<Header />
	<Toast />
	<slot />
</div>
