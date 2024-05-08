<script lang="ts">
	import { AW_DAO_INFRA, TOAST_TYPES } from '$lib/constants';
	import { activePlanetStore, session, toastStore } from '$lib/stores';
	import { pushActions } from '$lib/utils/wharfkit/session';
	import { CommandOutline } from 'flowbite-svelte-icons';
	import { afterUpdate, createEventDispatcher, onMount } from 'svelte';
	import { cubicIn, cubicOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';

	export let selectedArticle: any = {};
	export let user_identity: any = {};

	const dispatch = createEventDispatcher();
	let showActions = false;

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

	function toggleActions() {
		showActions = !showActions;
	}
</script>

<div class="fixed bottom-0 left-0 right-0 flex flex-col md:relative">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<p class="hidden text-center text-2xl underline underline-offset-4 md:block">Actions</p>
	<!-- Mobile view: Toggle button -->
	<button
		class="fixed bottom-5 right-5 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg md:hidden"
		class:bg-indigo-700={showActions}
		on:click={toggleActions}
	>
		<CommandOutline class="pointer-events-none h-6 w-6" />
	</button>
	{#if $session && showActions}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			on:click={() => (showActions = false)}
			class:inset-0={showActions}
			class="fixed bottom-14 left-5 right-5 z-50 content-end md:hidden"
		>
			<div class="flex flex-row-reverse flex-wrap justify-center gap-1 p-2 backdrop-blur-sm">
				<!-- {#if user_identity && user_identity?.wallet == String($session.actor)} -->
				<button
					class:hidden={!(user_identity && user_identity?.wallet == String($session.actor))}
					class="min-w-8 basis-1/4 rounded-xl bg-indigo-500 p-2 text-sm font-bold text-white hover:bg-indigo-700"
					on:click={() => onSet(null)}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Create New
				</button>
				<!-- {/if} -->
				<!-- {#if selectedArticle && (selectedArticle?.creator == user_identity?.wallet || user_identity?.permission_level == AW_DAO_INFRA.PERMISSION_LEVEL.PARENT)} -->
				<button
					class:hidden={!(
						selectedArticle &&
						(selectedArticle?.creator == user_identity?.wallet ||
							user_identity?.permission_level == AW_DAO_INFRA.PERMISSION_LEVEL.PARENT)
					)}
					class="min-w-8 basis-1/4 rounded-xl bg-yellow-500 p-2 text-sm font-bold text-white hover:bg-yellow-700"
					on:click={() => onSet(selectedArticle)}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Update
				</button>
				<button
					class:hidden={!(
						selectedArticle &&
						(selectedArticle?.creator == user_identity?.wallet ||
							user_identity?.permission_level == AW_DAO_INFRA.PERMISSION_LEVEL.PARENT)
					)}
					class="min-w-8 basis-1/4 rounded-xl bg-red-500 p-2 text-sm font-bold text-white hover:bg-red-700"
					on:click={() => onRemove()}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Remove
				</button>
				<!-- {/if} -->
			</div>
		</div>
	{/if}
	{#if $session}
		<div class="mt-5 hidden max-w-32 flex-wrap justify-center md:flex">
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
