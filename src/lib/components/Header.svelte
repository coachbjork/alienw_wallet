<script lang="ts">
	// import { language } from '@inlang/sdk-js';
	import Login from '$lib/components/Wallet/Login.svelte';
</script>

<header>
	<!-- <a href="/{language}">
		<h1>Home</h1>
	</a> -->

	<div class="flex flex-row">
		<div class="basis-1/4" />
		<div class="basis-1/4" />
		<div class="basis-1/2">
			<div class="mr-16 flex items-start justify-end">
				<Login />
			</div>
		</div>
	</div>
</header>

<style>
</style>
