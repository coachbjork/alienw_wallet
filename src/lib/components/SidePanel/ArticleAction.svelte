<script lang="ts">
	import { AW_DAO_INFRA, TOAST_TYPES } from '$lib/constants';
	import { activePlanetStore, session, toastStore } from '$lib/stores';
	import { pushActions } from '$lib/utils/wharfkit/session';
	import { afterUpdate, createEventDispatcher, onMount } from 'svelte';

	export let selectedArticle: any = {};
	export let user_identity: any = {};

	const dispatch = createEventDispatcher();

	onMount(async () => {});

	afterUpdate(async () => {});

	function onSet(article: any) {
		dispatch('set', { article });
	}

	function refresh() {
		dispatch('refresh');
	}

	async function onRemove() {
		if (!$session) {
			toastStore.add('Please login to vote', TOAST_TYPES.WARNING);
			return;
		}

		let actions = [
			{
				account: AW_DAO_INFRA.CONTRACT_NAME,
				name: AW_DAO_INFRA.ACTIONS.REMOVE_ARTICLE,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					dac_id: $activePlanetStore.scope,
					executor: String($session.actor),
					article_id: selectedArticle.article_id
				}
			}
		];
		await pushActions($session, actions);
		refresh();
	}
</script>

<div class="flex flex-col">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<p
		class=" text-center text-2xl underline underline-offset-4"
		on:click={() => dispatch('mockdata', {})}
	>
		Actions
	</p>
	{#if $session}
		<div class="mt-5 flex max-w-32 flex-wrap justify-center">
			{#if user_identity && user_identity?.wallet == String($session.actor)}
				<button
					class="m-1 min-w-32 grow rounded-xl bg-indigo-500 p-2 font-bold text-white hover:bg-indigo-700"
					on:click={() => onSet(null)}
				>
					Create New
				</button>
			{/if}
			{#if selectedArticle && (selectedArticle?.creator == user_identity?.wallet || user_identity?.permission_level == AW_DAO_INFRA.PERMISSION_LEVEL.PARENT)}
				<button
					class="m-1 min-w-32 grow rounded-xl bg-yellow-500 p-2 font-bold text-white hover:bg-yellow-700"
					on:click={() => onSet(selectedArticle)}
				>
					Update
				</button>
				<button
					class="m-1 min-w-32 grow rounded-xl bg-red-500 p-2 font-bold text-white hover:bg-red-700"
					on:click={() => onRemove()}
				>
					Remove
				</button>
			{/if}
		</div>
	{:else}
		<p class="mt-5 text-center">Login to call actions</p>
	{/if}
</div>

<style>
</style>
