<script lang="ts">
	import { AW_MSIG, TOAST_TYPES } from '$lib/constants';
	import { activePlanetStore, session, toastStore } from '$lib/stores';
	import { pushActions } from '$lib/utils/wharfkit/session';
	import { afterUpdate, createEventDispatcher, onMount } from 'svelte';

	export let selectedProposal: any = {};
	let enableActions: any = [];
	const dispatch = createEventDispatcher();

	onMount(async () => {
		setEnableActions();
		console.log(String($session?.permission));
	});

	afterUpdate(async () => {
		setEnableActions();
	});

	function onNewProposal() {
		dispatch('new_msig_proposal', {});
	}

	function setEnableActions() {
		if (selectedProposal && $session) {
			enableActions = [];
			// switch (selectedProposal.state) {
			// 	case AW_MSIG.PROP_STATE.PENDING.value:
			// 		enableActions = [];
			// 		break;
			// 	case AW_MSIG.PROP_STATE.EXECUTED.value:
			// 		enableActions = [];

			// 		break;
			// 	case AW_MSIG.PROP_STATE.CANCELLED.value:
			// 		enableActions = [];
			// 		break;
			// 	default:
			// 		enableActions = [];
			// 		break;
			// }
			enableActions.push(AW_MSIG.ACTIONS.APPROVE);
			enableActions.push(AW_MSIG.ACTIONS.UNAPPROVE);
			enableActions.push(AW_MSIG.ACTIONS.EXECUTE);
			enableActions.push(AW_MSIG.ACTIONS.CANCEL);
			enableActions.push(AW_MSIG.ACTIONS.PROPOSE);
		} else {
			enableActions = [];
		}
	}

	async function onApprove() {
		if (!$session) {
			toastStore.add('Please login to call action', TOAST_TYPES.WARNING);
			return;
		}

		let actions = [
			{
				account: AW_MSIG.CONTRACT_NAME,
				name: AW_MSIG.ACTIONS.APPROVE,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					proposal_name: selectedProposal.proposal_id,
					level: {
						actor: String($session.actor),
						permission: String($session?.permission)
					},
					dac_id: $activePlanetStore.scope
				}
			}
		];
		await pushActions($session, actions);
	}

	async function onRevoke() {
		if (!$session) {
			toastStore.add('Please login to call action', TOAST_TYPES.WARNING);
			return;
		}

		let actions = [
			{
				account: AW_MSIG.CONTRACT_NAME,
				name: AW_MSIG.ACTIONS.UNAPPROVE,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					proposal_name: selectedProposal.proposal_id,
					level: {
						actor: String($session.actor),
						permission: String($session?.permission)
					},
					dac_id: $activePlanetStore.scope
				}
			}
		];
		await pushActions($session, actions);
	}

	async function onCancel() {
		if (!$session) {
			toastStore.add('Please login to call action', TOAST_TYPES.WARNING);
			return;
		}

		let actions = [
			{
				account: AW_MSIG.CONTRACT_NAME,
				name: AW_MSIG.ACTIONS.CANCEL,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					proposal_name: selectedProposal.proposal_id,
					canceler: String($session.actor),
					dac_id: $activePlanetStore.scope
				}
			}
		];
		await pushActions($session, actions);
	}

	async function onExecute() {
		if (!$session) {
			toastStore.add('Please login to call action', TOAST_TYPES.WARNING);
			return;
		}

		let actions = [
			{
				account: AW_MSIG.CONTRACT_NAME,
				name: AW_MSIG.ACTIONS.EXECUTE,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					proposal_name: selectedProposal.proposal_id,
					executer: String($session.actor),
					dac_id: $activePlanetStore.scope
				}
			}
		];
		await pushActions($session, actions);
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
			<!-- {#if enableActions.includes(AW_MSIG.ACTIONS.PROPOSE)} -->
			<button
				class="m-1 min-w-32 grow rounded-xl bg-indigo-500 p-2 font-bold text-white hover:bg-indigo-700"
				on:click={() => onNewProposal()}
			>
				New Msig
			</button>
			<!-- {/if} -->

			{#if enableActions.includes(AW_MSIG.ACTIONS.APPROVE)}
				<button
					class="m-1 min-w-32 grow rounded-xl bg-green-500 p-2 font-bold text-white hover:bg-green-700"
					on:click={() => onApprove()}
				>
					Approve
				</button>
			{/if}
			{#if enableActions.includes(AW_MSIG.ACTIONS.UNAPPROVE)}
				<button
					class="m-1 min-w-32 grow rounded-xl bg-yellow-500 p-2 font-bold text-white hover:bg-yellow-700"
					on:click={() => onRevoke()}
				>
					Revoke
				</button>
			{/if}
			{#if enableActions.includes(AW_MSIG.ACTIONS.EXECUTE)}
				<button
					class="m-1 min-w-32 grow rounded-xl bg-blue-500 p-2 font-bold text-white hover:bg-blue-700"
					on:click={() => onExecute()}
				>
					Execute
				</button>
			{/if}
			{#if enableActions.includes(AW_MSIG.ACTIONS.CANCEL)}
				<button
					class="m-1 min-w-32 grow rounded-xl bg-gray-500 p-2 font-bold text-white hover:bg-gray-700"
					on:click={() => onCancel()}
				>
					Cancel
				</button>
			{/if}
		</div>
	{:else}
		<p class="mt-5 text-center">Login to call actions</p>
	{/if}
</div>

<style>
</style>
