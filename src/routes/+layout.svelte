<script lang="ts">
	import '../app.css';

	import Header from '$lib/components/Header.svelte';
	import Toast from '$lib/components/Toast.svelte';
</script>

<div class="fullpage">
	<Header />
	<Toast />
	<div class="left-side">
		<!-- <EndpointCfg>
			<slot name="xyz" />
		</EndpointCfg> -->
	</div>
	<div class="right-side"></div>
	<div class="main-content py-6">
		<slot />
	</div>
</div>
