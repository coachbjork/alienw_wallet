<script lang="ts">
	import ShareFromSquareRegular from 'svelte-awesome-icons/ShareFromSquareRegular.svelte';
	import { fade } from 'svelte/transition';

	export let custodians: any = [];
	export let staked: string = '';
</script>

<div class="council_side_panel" transition:fade={{ duration: 500 }}>
	{#if custodians.length > 0}
		<p class="pb-4 text-2xl">Voted For</p>
	{/if}
	{#each custodians as custodian}
		<div class="council_side_candidate" transition:fade={{ duration: 500 }} id="horizontal">
			<div class="img_area" id="horizontal">
				<img class="candidate_side_panel" src={custodian.image} alt={custodian.name} />
			</div>
			<div class="candidate_name">
				<p>{custodian.name}</p>
			</div>
			<div class="candidate_acc">
				<a
					href="https://waxblock.io/account/{custodian.candidate_name}"
					target="_blank"
					class="flex flex-row"
				>
					{custodian.candidate_name}<ShareFromSquareRegular class="ml-1" size={15} /></a
				>
			</div>
		</div>
	{/each}
	{#if staked !== ''}
		<div
			class="staked_value mb-4 text-lg font-semibold text-white"
			transition:fade={{ duration: 500 }}
		>
			Staked: {staked}
		</div>
	{/if}
</div>

<style>
	/* Side Council Panel */
	.council_side_panel {
		width: 250px;
		border-radius: 20px;
		padding: 10px;
	}
	.council_side_candidate {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr 0.2fr 0.2fr;
		gap: 0px 0px;
		grid-auto-flow: row;
		justify-content: center;
		justify-self: center;
		align-self: start;

		grid-template-areas:
			'img_area'
			'candidate_name'
			'candidate_acc';
		padding: 5px 5px 5px 5px;
	}
	.council_side_candidate#horizontal {
		display: grid;
		grid-template-columns: 30% 70%;
		grid-template-rows: minmax(30px, 40px) minmax(30px, 40px);
		gap: 0px 5px;
		grid-auto-flow: row;
		justify-self: center;
		align-self: start;
		grid-template-areas:
			'img_area candidate_name'
			'img_area candidate_acc';
		padding: 1px 1px 1px 1px;
		box-shadow: rgb(221, 244, 248, 0.45) 1px 1px 2px 1px;
		border-radius: 20px;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		margin-bottom: 10px;
		padding-left: 5px;
	}

	.img_area {
		grid-area: img_area;
		max-height: 80px;
		justify-content: center;
		justify-self: center;
		margin-left: 4px;
	}

	.img_area img {
		filter: drop-shadow(1px 2px 2px rgb(221, 244, 248, 0.3));
		border-radius: 30%;
	}

	.img_area#horizontal {
		grid-area: img_area;
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: center;
		max-height: 100px;
	}

	img.candidate_side_panel {
		width: 62px;
		height: 62px;
		justify-self: center;
		border-radius: 50%;
	}

	.candidate_name {
		display: flex;
		grid-area: candidate_name;
		text-align: left;
		align-self: flex-end;
		overflow: hidden;
		text-transform: Capitalize;
		text-decoration: underline;
	}

	.candidate_acc {
		display: flex;
		grid-area: candidate_acc;
		text-align: left;
		align-self: flex-start;
		font-style: italic;
		font-size: 80%;
	}

	.council_side_panel p,
	.council_side_panel a {
		margin: 0;
		color: white;
		text-align: center;
	}

	/* .council_side_panel p#hl {
		text-decoration: underline;
	} */
	.staked_value {
		@apply mb-4 text-lg font-semibold text-white;
	}
</style>
