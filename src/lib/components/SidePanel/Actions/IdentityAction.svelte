<script lang="ts">
	import { AW_DAO_INFRA, TOAST_TYPES } from '$lib/constants';
	import { activePlanetStore, session, toastStore } from '$lib/stores';
	import { pushActions } from '$lib/utils/wharfkit/session';
	import { afterUpdate, createEventDispatcher, onMount } from 'svelte';
	import { cubicIn, cubicOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import Actions from './Actions.svelte';

	export let selectedIdentity: any = {};
	export let user_identity: any = {};

	const dispatch = createEventDispatcher();
	let showActions = false;

	onMount(async () => {});

	afterUpdate(async () => {});

	function onSetIdentity(identity: any) {
		dispatch('set_identity', { identity });
	}

	function refresh() {
		dispatch('refresh');
	}

	async function onRemoveIdentity() {
		if (!$session) {
			toastStore.add('Please login to vote', TOAST_TYPES.WARNING);
			return;
		}

		let actions = [
			{
				account: AW_DAO_INFRA.CONTRACT_NAME,
				name: AW_DAO_INFRA.ACTIONS.REMOVE_IDENTITY,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					dac_id: $activePlanetStore.scope,
					executor: String($session.actor),
					wallet: selectedIdentity.wallet
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

<Actions bind:showActions>
	{#if $session && showActions}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			on:click={() => (showActions = false)}
			class:inset-0={showActions}
			class="fixed bottom-0 left-0 right-0 z-50 content-end md:hidden"
		>
			<div class="mb-20 flex flex-row-reverse flex-wrap justify-center gap-1 p-2 backdrop-blur-sm">
				<!-- {#if user_identity?.permission_level == AW_DAO_INFRA.PERMISSION_LEVEL.PARENT} -->
				<button
					class:hidden={user_identity?.permission_level != AW_DAO_INFRA.PERMISSION_LEVEL.PARENT}
					class="min-w-8 basis-1/4 rounded-xl bg-indigo-500 p-2 text-sm font-bold text-white hover:bg-indigo-700"
					on:click={() => onSetIdentity(null)}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Create New
				</button>
				<!-- {/if}
				{#if selectedIdentity && (selectedIdentity?.wallet == user_identity?.wallet || user_identity?.permission_level == AW_DAO_INFRA.PERMISSION_LEVEL.PARENT)} -->
				<button
					class:hidden={!(
						selectedIdentity &&
						(selectedIdentity?.wallet == user_identity?.wallet ||
							user_identity?.permission_level == AW_DAO_INFRA.PERMISSION_LEVEL.PARENT)
					)}
					class="min-w-8 basis-1/4 rounded-xl bg-yellow-500 p-2 text-sm font-bold text-white hover:bg-yellow-700"
					on:click={() => onSetIdentity(selectedIdentity)}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Update
				</button>
				<!-- {/if}
				{#if selectedIdentity && user_identity?.permission_level == AW_DAO_INFRA.PERMISSION_LEVEL.PARENT} -->
				<button
					class:hidden={!(
						selectedIdentity &&
						user_identity?.permission_level == AW_DAO_INFRA.PERMISSION_LEVEL.PARENT
					)}
					class="min-w-8 basis-1/4 rounded-xl bg-red-500 p-2 text-sm font-bold text-white hover:bg-red-700"
					on:click={() => onRemoveIdentity()}
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
			{#if user_identity?.permission_level == AW_DAO_INFRA.PERMISSION_LEVEL.PARENT}
				<button
					class="m-1 min-w-32 grow rounded-xl bg-indigo-500 p-2 font-bold text-white hover:bg-indigo-700"
					on:click={() => onSetIdentity(null)}
				>
					Create New
				</button>
			{/if}
			{#if selectedIdentity && (selectedIdentity?.wallet == user_identity?.wallet || user_identity?.permission_level == AW_DAO_INFRA.PERMISSION_LEVEL.PARENT)}
				<button
					class="m-1 min-w-32 grow rounded-xl bg-yellow-500 p-2 font-bold text-white hover:bg-yellow-700"
					on:click={() => onSetIdentity(selectedIdentity)}
				>
					Update
				</button>
			{/if}
			{#if selectedIdentity && user_identity?.permission_level == AW_DAO_INFRA.PERMISSION_LEVEL.PARENT}
				<button
					class="m-1 min-w-32 grow rounded-xl bg-red-500 p-2 font-bold text-white hover:bg-red-700"
					on:click={() => onRemoveIdentity()}
				>
					Remove
				</button>
			{/if}
		</div>
	{:else}
		<p class="mt-5 text-center">Login to call actions</p>
	{/if}
</Actions>

<style>
</style>
