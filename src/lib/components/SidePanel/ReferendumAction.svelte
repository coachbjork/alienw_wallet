<script lang="ts">
	import { goto } from '$app/navigation';
	import { AW_REFERENDUM, TOAST_TYPES } from '$lib/constants';
	import { activePlanetStore, session, toastStore } from '$lib/stores';
	import { pushActions } from '$lib/utils/wharfkit/session';
	import { CommandOutline } from 'flowbite-svelte-icons';
	import { afterUpdate, createEventDispatcher, onMount } from 'svelte';
	import { cubicIn, cubicOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';

	export let selectedItem: any = {};

	const dispatch = createEventDispatcher();
	let enableActions: any = [];
	let showActions = false;

	onMount(async () => {
		setEnableActions();
	});

	afterUpdate(async () => {
		setEnableActions();
	});

	function refresh() {
		dispatch('refresh');
	}

	function toggleActions() {
		showActions = !showActions;
	}

	function setEnableActions() {
		if ($session) {
			enableActions = [];

			if (selectedItem) {
				if (
					selectedItem.status != AW_REFERENDUM.STATUS.EXECUTED.value &&
					selectedItem.status != AW_REFERENDUM.STATUS.EXPIRED.value
				) {
					enableActions.push(AW_REFERENDUM.ACTIONS.VOTE);
					if (String($session.actor) == selectedItem.proposer) {
						enableActions.push(AW_REFERENDUM.ACTIONS.CANCEL);
					}
				}

				if (
					selectedItem.status == AW_REFERENDUM.STATUS.PASSING.value &&
					(selectedItem.type == AW_REFERENDUM.REF_TYPE.BINDING ||
						selectedItem.type == AW_REFERENDUM.REF_TYPE.SEMI_BINDING)
				) {
					enableActions.push(AW_REFERENDUM.ACTIONS.EXECUTE);
				}
				enableActions.push(AW_REFERENDUM.ACTIONS.UPDATE_STATUS);
			}

			enableActions.push(AW_REFERENDUM.ACTIONS.DEPOSIT);
			enableActions.push(AW_REFERENDUM.ACTIONS.REFUND);
		} else {
			enableActions = [];
		}
	}

	async function onRefund() {
		if (!$session) {
			toastStore.add('Please login to call action', TOAST_TYPES.WARNING);
			return;
		}

		let actions = [
			{
				account: AW_REFERENDUM.CONTRACT_NAME,
				name: AW_REFERENDUM.ACTIONS.REFUND,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					account: String($session.actor)
				}
			}
		];
		await pushActions($session, actions).then(() => {
			refresh();
		});
	}

	async function onUpdateStatus() {
		if (!$session) {
			toastStore.add('Please login to call action', TOAST_TYPES.WARNING);
			return;
		}

		let actions = [
			{
				account: AW_REFERENDUM.CONTRACT_NAME,
				name: AW_REFERENDUM.ACTIONS.UPDATE_STATUS,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					referendum_id: selectedItem.referendum_id,
					dac_id: $activePlanetStore.scope
				}
			}
		];
		await pushActions($session, actions).then(() => {
			refresh();
		});
	}

	async function onCancel() {
		if (!$session) {
			toastStore.add('Please login to call action', TOAST_TYPES.WARNING);
			return;
		}

		let actions = [
			{
				account: AW_REFERENDUM.CONTRACT_NAME,
				name: AW_REFERENDUM.ACTIONS.CANCEL,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					referendum_id: selectedItem.referendum_id,
					dac_id: $activePlanetStore.scope
				}
			}
		];
		await pushActions($session, actions).then(() => {
			refresh();
		});
	}

	async function onExecute() {
		if (!$session) {
			toastStore.add('Please login to call action', TOAST_TYPES.WARNING);
			return;
		}

		let actions = [
			{
				account: AW_REFERENDUM.CONTRACT_NAME,
				name: AW_REFERENDUM.ACTIONS.EXECUTE,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					referendum_id: selectedItem.referendum_id,
					dac_id: $activePlanetStore.scope
				}
			}
		];
		await pushActions($session, actions).then(() => {
			refresh();
		});
	}

	function navigateToMsigCreate(isCopy: boolean = false) {
		if (isCopy) {
			const data = {
				actions: selectedItem.actions,
				proposal_title: selectedItem.proposal_title,
				description: selectedItem.description
			};

			goto('/referendum/create', { state: { data } });
		} else goto('/referendum/create');
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
				<button
					on:click={() => navigateToMsigCreate()}
					class=" min-w-8 basis-1/4 truncate text-wrap rounded-xl bg-indigo-500 p-2 text-center text-sm font-bold text-white hover:bg-indigo-700"
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					New Referendum
				</button>

				<!-- {#if enableActions.includes(AW_REFERENDUM.ACTIONS.DEPOSIT)}
				<button
					class="min-w-8 basis-1/4 text-sm rounded-xl bg-purple-500 p-2 font-bold text-white hover:bg-purple-700"
					on:click={() => onCancel()}
				>
					Deposit
				</button>
			{/if} -->
				<!-- {#if enableActions.includes(AW_REFERENDUM.ACTIONS.REFUND)}
				<button
					class="min-w-8 basis-1/4 text-sm rounded-xl bg-pink-500 p-2 font-bold text-white hover:bg-pink-700"
					on:click={() => onRefund()}
				>
					Refund
				</button>
			{/if} -->
				<!-- {#if enableActions.includes(AW_REFERENDUM.ACTIONS.UPDATE_STATUS)} -->
				<button
					class:hidden={!enableActions.includes(AW_REFERENDUM.ACTIONS.UPDATE_STATUS)}
					class="min-w-8 basis-1/4 truncate text-wrap rounded-xl bg-teal-500 p-2 text-sm font-bold text-white hover:bg-teal-700"
					on:click={() => onUpdateStatus()}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Update Status
				</button>
				<!-- {/if}

				{#if enableActions.includes(AW_REFERENDUM.ACTIONS.VOTE)} -->
				<button
					class:hidden={!enableActions.includes(AW_REFERENDUM.ACTIONS.VOTE)}
					class="min-w-8 basis-1/4 truncate text-wrap rounded-xl bg-green-500 p-2 text-sm font-bold text-white hover:bg-green-700"
					on:click={() => {
						// onVote(AW_REFERENDUM.VOTE.YES.value)
						dispatch('onVote', {
							vote_type: AW_REFERENDUM.VOTE.YES.value,
							referendum_id: selectedItem.referendum_id
						});
					}}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Vote Yes
				</button>
				<button
					class:hidden={!enableActions.includes(AW_REFERENDUM.ACTIONS.VOTE)}
					class="min-w-8 basis-1/4 truncate text-wrap rounded-xl bg-red-500 p-2 text-sm font-bold text-white hover:bg-red-700"
					on:click={() => {
						// onVote(AW_REFERENDUM.VOTE.NO.value)
						dispatch('onVote', {
							vote_type: AW_REFERENDUM.VOTE.NO.value,
							referendum_id: selectedItem.referendum_id
						});
					}}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Vote No
				</button>
				<button
					class:hidden={!enableActions.includes(AW_REFERENDUM.ACTIONS.VOTE)}
					class="min-w-8 basis-1/4 truncate text-wrap rounded-xl bg-gray-500 p-2 text-sm font-bold text-white hover:bg-gray-700"
					on:click={() => {
						//  onVote(AW_REFERENDUM.VOTE.ABSTAIN.value)
						dispatch('onVote', {
							vote_type: AW_REFERENDUM.VOTE.ABSTAIN.value,
							referendum_id: selectedItem.referendum_id
						});
					}}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Vote Abstain
				</button>
				<button
					class:hidden={!enableActions.includes(AW_REFERENDUM.ACTIONS.VOTE)}
					class="min-w-8 basis-1/4 truncate text-wrap rounded-xl bg-purple-500 p-2 text-sm font-bold text-white hover:bg-purple-700"
					on:click={() => {
						// onVote(AW_REFERENDUM.VOTE.REMOVE.value)
						dispatch('onVote', {
							vote_type: AW_REFERENDUM.VOTE.REMOVE.value,
							referendum_id: selectedItem.referendum_id
						});
					}}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Remove Vote
				</button>
				<!-- {/if}
				{#if enableActions.includes(AW_REFERENDUM.ACTIONS.CANCEL)} -->
				<button
					class:hidden={!enableActions.includes(AW_REFERENDUM.ACTIONS.CANCEL)}
					class="min-w-8 basis-1/4 truncate text-wrap rounded-xl bg-yellow-500 p-2 text-sm font-bold text-white hover:bg-yellow-700"
					on:click={() => onCancel()}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Cancel
				</button>
				<!-- {/if} -->
				<!-- {#if enableActions.includes(AW_REFERENDUM.ACTIONS.EXECUTE)} -->
				<button
					class:hidden={!enableActions.includes(AW_REFERENDUM.ACTIONS.EXECUTE)}
					class="min-w-8 basis-1/4 truncate text-wrap rounded-xl bg-blue-500 p-2 text-sm font-bold text-white hover:bg-blue-700"
					on:click={() => onExecute()}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Execute
				</button>
				<!-- {/if} -->
			</div>
		</div>
	{/if}
	{#if $session}
		<div class="mt-5 hidden max-w-32 flex-wrap justify-center md:flex">
			<button
				on:click={() => navigateToMsigCreate()}
				class="m-1 min-w-32 grow rounded-xl bg-indigo-500 p-2 text-center font-bold text-white hover:bg-indigo-700"
			>
				New Referendum
			</button>

			<!-- {#if enableActions.includes(AW_REFERENDUM.ACTIONS.DEPOSIT)}
				<button
					class="m-1 min-w-32 grow rounded-xl bg-purple-500 p-2 font-bold text-white hover:bg-purple-700"
					on:click={() => onCancel()}
				>
					Deposit
				</button>
			{/if} -->
			<!-- {#if enableActions.includes(AW_REFERENDUM.ACTIONS.REFUND)}
				<button
					class="m-1 min-w-32 grow rounded-xl bg-pink-500 p-2 font-bold text-white hover:bg-pink-700"
					on:click={() => onRefund()}
				>
					Refund
				</button>
			{/if} -->
			{#if enableActions.includes(AW_REFERENDUM.ACTIONS.UPDATE_STATUS)}
				<button
					class="m-1 min-w-32 grow rounded-xl bg-teal-500 p-2 font-bold text-white hover:bg-teal-700"
					on:click={() => onUpdateStatus()}
				>
					Update Status
				</button>
			{/if}

			{#if enableActions.includes(AW_REFERENDUM.ACTIONS.VOTE)}
				<button
					class="m-1 min-w-32 grow rounded-xl bg-green-500 p-2 font-bold text-white hover:bg-green-700"
					on:click={() => {
						// onVote(AW_REFERENDUM.VOTE.YES.value)
						dispatch('onVote', {
							vote_type: AW_REFERENDUM.VOTE.YES.value,
							referendum_id: selectedItem.referendum_id
						});
					}}
				>
					Vote Yes
				</button>
				<button
					class="m-1 min-w-32 grow rounded-xl bg-red-500 p-2 font-bold text-white hover:bg-red-700"
					on:click={() => {
						// onVote(AW_REFERENDUM.VOTE.NO.value)
						dispatch('onVote', {
							vote_type: AW_REFERENDUM.VOTE.NO.value,
							referendum_id: selectedItem.referendum_id
						});
					}}
				>
					Vote No
				</button>
				<button
					class="m-1 min-w-32 grow rounded-xl bg-gray-500 p-2 font-bold text-white hover:bg-gray-700"
					on:click={() => {
						//  onVote(AW_REFERENDUM.VOTE.ABSTAIN.value)
						dispatch('onVote', {
							vote_type: AW_REFERENDUM.VOTE.ABSTAIN.value,
							referendum_id: selectedItem.referendum_id
						});
					}}
				>
					Vote Abstain
				</button>
				<button
					class="m-1 min-w-32 grow rounded-xl bg-purple-500 p-2 font-bold text-white hover:bg-purple-700"
					on:click={() => {
						// onVote(AW_REFERENDUM.VOTE.REMOVE.value)
						dispatch('onVote', {
							vote_type: AW_REFERENDUM.VOTE.REMOVE.value,
							referendum_id: selectedItem.referendum_id
						});
					}}
				>
					Remove Vote
				</button>
			{/if}
			{#if enableActions.includes(AW_REFERENDUM.ACTIONS.CANCEL)}
				<button
					class="m-1 min-w-32 grow rounded-xl bg-yellow-500 p-2 font-bold text-white hover:bg-yellow-700"
					on:click={() => onCancel()}
				>
					Cancel
				</button>
			{/if}
			{#if enableActions.includes(AW_REFERENDUM.ACTIONS.EXECUTE)}
				<button
					class="m-1 min-w-32 grow rounded-xl bg-blue-500 p-2 font-bold text-white hover:bg-blue-700"
					on:click={() => onExecute()}
				>
					Execute
				</button>
			{/if}
		</div>
	{:else}
		<p class="mt-5 text-center">Login to call actions</p>
	{/if}
</div>

<style>
</style>
