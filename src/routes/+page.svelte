<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		goto('/voting');
	});
</script>

<div class="main-content py-6">
	<h1>Welcome to Alienw Wallet</h1>
</div>
<div class="left-side"></div>
<div class="right-side"></div>
