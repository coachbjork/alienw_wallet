<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import '../app.css';
</script>

<div class="fullpage slashed-zero antialiased">
	<Header />
	<Toast />
	<slot />
</div>
