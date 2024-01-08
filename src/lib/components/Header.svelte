<script lang="ts">
	import Login from '$lib/components/Wallet/Login.svelte';
	import EndpointCfg from './Setting/EndpointCfg.svelte';
</script>

<div class="menu-grid">
	<header id="header">
		<div class="mt-1 flex flex-row">
			<div class="basis-1/4" />
			<div class="basis-1/4" />
			<div class="basis-1/2">
				<div class="mr-16 flex items-center justify-end">
					<Login />
					<EndpointCfg />
				</div>
			</div>
		</div>
	</header>
</div>

<style>
</style>
