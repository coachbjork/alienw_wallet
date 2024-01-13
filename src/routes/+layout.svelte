<script lang="ts">
	import '../app.css';

	import Header from '$lib/components/Header.svelte';
	import Toast from '$lib/components/Toast.svelte';
</script>

<div class="fullpage">
	<Header />
	<Toast />
	<slot />
</div>
