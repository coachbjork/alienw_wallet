<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';

	onMount(() => {
		goto(`${base}/voting`);
	});
</script>

<div class="main-content py-6">
	<h1>Welcome to Alienw Wallet</h1>
</div>
<div class="left-side"></div>
<div class="right-side"></div>
