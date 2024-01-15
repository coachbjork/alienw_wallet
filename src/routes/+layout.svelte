<script lang="ts">
	import '../app.css';

	import Header from '$lib/components/Header.svelte';
	import Toast from '$lib/components/Toast.svelte';
	// import { blockchain_rpc } from '$lib/stores';
	// import { onMount } from 'svelte';

	// onMount(() => {
	// 	console.log('layout mounted');
	// 	// load local storage and update setting store
	// 	const stored = window.localStorage.getItem('blockchain_rpc');
	// 	console.log('stored@', stored);
	// 	if (stored) {
	// 		console.log('stored@set', stored);
	// 		blockchain_rpc.set(stored);
	// 	}
	// });
</script>

<div class="fullpage">
	<Header />
	<Toast />
	<slot />
</div>
