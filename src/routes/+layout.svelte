<script lang="ts">
	import '../app.css';

	import Header from '$lib/components/Header.svelte';
</script>

<div class="fullpage">
	<Header />
	<div class="left-side">
		<!-- <EndpointCfg>
			<slot name="xyz" />
		</EndpointCfg> -->
	</div>
	<div class="right-side"></div>
	<div class="main-content">
		<slot />
	</div>
</div>
