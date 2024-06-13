<script lang="ts">
	import Login from '$lib/components/Wallet/Login.svelte';
	import NavBar from './NavBar.svelte';
	import PlanetBalance from './PlanetBalance.svelte';
	import EndpointCfg from './Setting/EndpointCfg.svelte';
</script>

<div class="menu-grid">
	<header>
		<div class="flex flex-row justify-between md:flex-col">
			<div class="mt-1 flex flex-row md:flex-row-reverse">
				<div class="flex w-full flex-row items-center justify-between">
					<h1
						class="ml-10 hidden bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-xl font-bold text-transparent md:flex"
					>
						Alien Wallet
					</h1>
					<div class="flex items-center md:justify-end">
						<NavBar />
					</div>
				</div>
			</div>
			<div class="mt-1 flex flex-row items-center justify-between md:flex-row">
				<PlanetBalance class="my-1 md:ml-5" />
				<div class="mr-5 flex items-center">
					<Login />
					<EndpointCfg />
				</div>
			</div>
		</div>
	</header>
</div>

<style>
</style>
