<script lang="ts">
	import '../app.css';

	import Header from '$lib/components/Header.svelte';
</script>

<div class="fullpage">
	<Header />

	<slot />
</div>
