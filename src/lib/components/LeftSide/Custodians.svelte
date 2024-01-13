<!-- src/lib/components/Toast.svelte -->
<script lang="ts">
	export let custodians: any = [];

	$: console.log(custodians);
</script>

<div class="flex flex-col">
	<p class=" text-center text-2xl underline underline-offset-4">Custodians</p>
	<div class="flex flex-col">
		{#each custodians as custodian}
			<div class=" flex flex-row">
				<div class="">
					<p class="text-xl font-bold">{custodian.name}</p>
				</div>
				<div class="flex flex-col">
					<p class="text-xl font-bold">{custodian.name}</p>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
</style>
