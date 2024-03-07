<!-- This component is used to display nested objects in a readable format. -->
<!-- It uses recursion to display nested objects. -->

<script lang="ts">
	import RecursiveObjectDisplay from './RecursiveObjectDisplay.svelte';
	export let data: any;
</script>

{#if typeof data === 'object' && data !== null}
	<div class="object-display">
		{#each Object.entries(data) as [key, value]}
			<div class="key-value-pair">
				<span class="key">{key}:</span>
				<span class="value">
					{#if typeof value === 'object' && value !== null}
						<RecursiveObjectDisplay data={value} />
					{:else}
						{value}
					{/if}
				</span>
			</div>
		{/each}
	</div>
{:else}
	<span>{data}</span>
{/if}

<style>
	.object-display {
		margin-left: 1em;
	}
	.key-value-pair {
		margin-bottom: 0.5em;
	}
	.key {
		font-weight: bold;
	}
	.value {
		margin-left: 0.5em;
	}
</style>
