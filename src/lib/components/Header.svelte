<script lang="ts">
	import Login from '$lib/components/Wallet/Login.svelte';
	import NavBar from './NavBar.svelte';
	import EndpointCfg from './Setting/EndpointCfg.svelte';
</script>

<div class="menu-grid">
	<header class=" flex flex-row justify-between md:flex-col">
		<div class="mt-1 flex flex-row md:flex-row-reverse">
			<div class="basis-1/2">
				<div class="flex items-center md:justify-end">
					<NavBar />
				</div>
			</div>
		</div>
		<div class="mt-1 flex flex-row md:flex-row-reverse">
			<div class="mr-5 flex items-center justify-end">
				<Login />
				<EndpointCfg />
			</div>
		</div>
	</header>
</div>

<style>
</style>
