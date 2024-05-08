<script lang="ts">
	import { AW_WORKER_PROPOSALS, TOAST_TYPES } from '$lib/constants';
	import { activePlanetStore, session, toastStore } from '$lib/stores';
	import { pushActions } from '$lib/utils/wharfkit/session';
	import { CommandOutline } from 'flowbite-svelte-icons';
	import { afterUpdate, createEventDispatcher, onMount } from 'svelte';
	import { cubicIn, cubicOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';

	export let selectedProposal: any = {};
	let enableActions: any = [];
	const dispatch = createEventDispatcher();
	let showActions = false;

	onMount(async () => {
		setEnableActions();
	});

	afterUpdate(async () => {
		setEnableActions();
	});

	function onNewProposal() {
		dispatch('new_proposal', {});
	}

	function onDelegate(is_delegate: boolean) {
		dispatch('delegatevote', { is_delegate });
	}

	function refresh() {
		dispatch('refresh');
	}

	function setEnableActions() {
		if (selectedProposal && $session) {
			enableActions = [];
			switch (selectedProposal.state) {
				case AW_WORKER_PROPOSALS.PROP_STATE.PENDING_APPROVAL.value:
				case AW_WORKER_PROPOSALS.PROP_STATE.HAS_ENOUGH_APP_VOTES.value:
					enableActions = [];
					// TODO: uncomment
					// if ($custodiansStore.find((c) => c.cust_name == String($session?.actor))) {
					enableActions.push(AW_WORKER_PROPOSALS.ACTIONS.VOTE_PROPOSAL);
					// }
					if (selectedProposal.proposer == $session.actor) {
						enableActions.push(AW_WORKER_PROPOSALS.ACTIONS.CANCEL_PROPOSAL);
						enableActions.push(AW_WORKER_PROPOSALS.ACTIONS.START_WORK);
					}
					if (selectedProposal.arbiter == $session.actor && !selectedProposal.arbiter_agreed) {
						enableActions.push(AW_WORKER_PROPOSALS.ACTIONS.ARBITATOR_AGREE);
					}
					break;
				case AW_WORKER_PROPOSALS.PROP_STATE.IN_PROGRESS.value:
					if (selectedProposal.proposer == $session.actor) {
						enableActions = [
							AW_WORKER_PROPOSALS.ACTIONS.COMPLETE_WORK,
							AW_WORKER_PROPOSALS.ACTIONS.CANCEL_WIP_PROPOSAL
						];
					}
					break;
				case AW_WORKER_PROPOSALS.PROP_STATE.PENDING_FINALIZE.value:
					enableActions = [AW_WORKER_PROPOSALS.ACTIONS.FINALIZE_PROPOSAL];
					// TODO: uncomment
					// if ($custodiansStore.find((c) => c.cust_name == String($session?.actor))) {
					enableActions.push(AW_WORKER_PROPOSALS.ACTIONS.VOTE_FINISH_PROPOSAL);
					// }

					if (selectedProposal.proposer == $session.actor) {
						enableActions.push(AW_WORKER_PROPOSALS.ACTIONS.CANCEL_WIP_PROPOSAL);
						enableActions.push(AW_WORKER_PROPOSALS.ACTIONS.DISPUTE_UNAPPROVED_PROPOSAL);
					}
					break;
				case AW_WORKER_PROPOSALS.PROP_STATE.HAS_ENOUGH_FIN_VOTES.value:
					enableActions = [AW_WORKER_PROPOSALS.ACTIONS.FINALIZE_PROPOSAL];
					// TODO: uncomment
					// if ($custodiansStore.find((c) => c.cust_name == String($session?.actor))) {
					enableActions.push(AW_WORKER_PROPOSALS.ACTIONS.VOTE_FINISH_PROPOSAL);
					// }
					break;
				case AW_WORKER_PROPOSALS.PROP_STATE.DISPUTED.value:
					if (selectedProposal.arbiter == $session.actor) {
						enableActions = [AW_WORKER_PROPOSALS.ACTIONS.ARBIRATOR_VOTE];
					}
					break;
				case AW_WORKER_PROPOSALS.PROP_STATE.EXPIRED.value:
					enableActions = [AW_WORKER_PROPOSALS.ACTIONS.CLEAR_EXPIRED_PROPOSAL];
					break;
				default:
					enableActions = [];
					break;
			}
		} else {
			enableActions = [];
		}
	}

	async function onVote(vote: string) {
		if (!$session) {
			toastStore.add('Please login to vote', TOAST_TYPES.WARNING);
			return;
		}
		let action_name = '';
		switch (selectedProposal.state) {
			case AW_WORKER_PROPOSALS.PROP_STATE.PENDING_APPROVAL.value:
			case AW_WORKER_PROPOSALS.PROP_STATE.HAS_ENOUGH_APP_VOTES.value:
				action_name = AW_WORKER_PROPOSALS.ACTIONS.VOTE_PROPOSAL;
				break;
			case AW_WORKER_PROPOSALS.PROP_STATE.PENDING_FINALIZE.value:
			case AW_WORKER_PROPOSALS.PROP_STATE.HAS_ENOUGH_FIN_VOTES.value:
				action_name = AW_WORKER_PROPOSALS.ACTIONS.FINALIZE_PROPOSAL;
				break;
			default:
				toastStore.add('Proposal is not in a state to be voted on', TOAST_TYPES.WARNING);
				return;
		}
		let actions = [
			{
				account: AW_WORKER_PROPOSALS.CONTRACT_NAME,
				name: action_name,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					},
					{
						actor: String($activePlanetStore.account),
						permission: 'one'
					}
				],
				data: {
					custodian: $session.actor,
					proposal_id: selectedProposal.proposal_id,
					vote,
					dac_id: $activePlanetStore.scope
				}
			}
		];
		await pushActions($session, actions).then(() => {
			refresh();
		});
	}

	async function onArbiterVote(vote: string) {
		if (!$session) {
			toastStore.add('Please login to vote', TOAST_TYPES.WARNING);
			return;
		}
		let action_name = '';
		switch (vote) {
			case AW_WORKER_PROPOSALS.VOTE.VOTE_APPROVE.value:
				action_name = AW_WORKER_PROPOSALS.ACTIONS.ARBIRATOR_APPROVE;
				break;
			case AW_WORKER_PROPOSALS.VOTE.VOTE_DENY.value:
				action_name = AW_WORKER_PROPOSALS.ACTIONS.ARBIRATOR_DENY;
				break;
			default:
				toastStore.add('Error', TOAST_TYPES.WARNING);
				return;
		}
		let actions = [
			{
				account: AW_WORKER_PROPOSALS.CONTRACT_NAME,
				name: action_name,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					arbiter: $session.actor,
					proposal_id: selectedProposal.proposal_id,
					dac_id: $activePlanetStore.scope
				}
			}
		];
		await pushActions($session, actions).then(() => {
			refresh();
		});
	}

	async function onArbiterAgree() {
		if (!$session) {
			toastStore.add('Please login to vote', TOAST_TYPES.WARNING);
			return;
		}
		let action_name = AW_WORKER_PROPOSALS.ACTIONS.ARBITATOR_AGREE;

		let actions = [
			{
				account: AW_WORKER_PROPOSALS.CONTRACT_NAME,
				name: action_name,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					arbiter: $session.actor,
					proposal_id: selectedProposal.proposal_id,
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
			toastStore.add('Please login to vote', TOAST_TYPES.WARNING);
			return;
		}
		let action_name = '';
		switch (selectedProposal.state) {
			case AW_WORKER_PROPOSALS.PROP_STATE.PENDING_APPROVAL.value:
			case AW_WORKER_PROPOSALS.PROP_STATE.HAS_ENOUGH_APP_VOTES.value:
				action_name = AW_WORKER_PROPOSALS.ACTIONS.CANCEL_PROPOSAL;
				break;
			case AW_WORKER_PROPOSALS.PROP_STATE.PENDING_FINALIZE.value:
			case AW_WORKER_PROPOSALS.PROP_STATE.IN_PROGRESS.value:
				action_name = AW_WORKER_PROPOSALS.ACTIONS.CANCEL_WIP_PROPOSAL;
				break;
			default:
				toastStore.add('Proposal is not in a state to be canceled on', TOAST_TYPES.WARNING);
				return;
		}
		let actions = [
			{
				account: AW_WORKER_PROPOSALS.CONTRACT_NAME,
				name: action_name,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					proposal_id: selectedProposal.proposal_id,
					dac_id: $activePlanetStore.scope
				}
			}
		];
		await pushActions($session, actions).then(() => {
			refresh();
		});
	}

	async function onStartWork() {
		if (!$session) {
			toastStore.add('Please login to vote', TOAST_TYPES.WARNING);
			return;
		}
		let action_name = '';
		switch (selectedProposal.state) {
			case AW_WORKER_PROPOSALS.PROP_STATE.PENDING_APPROVAL.value:
			case AW_WORKER_PROPOSALS.PROP_STATE.HAS_ENOUGH_APP_VOTES.value:
				action_name = AW_WORKER_PROPOSALS.ACTIONS.START_WORK;
				break;
			default:
				toastStore.add('Proposal is not in a state to start work', TOAST_TYPES.WARNING);
				return;
		}
		let actions = [
			{
				account: AW_WORKER_PROPOSALS.CONTRACT_NAME,
				name: action_name,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					proposal_id: selectedProposal.proposal_id,
					dac_id: $activePlanetStore.scope
				}
			}
		];
		await pushActions($session, actions).then(() => {
			refresh();
		});
	}

	async function onCompleteWork() {
		if (!$session) {
			toastStore.add('Please login to vote', TOAST_TYPES.WARNING);
			return;
		}
		let action_name = '';
		switch (selectedProposal.state) {
			case AW_WORKER_PROPOSALS.PROP_STATE.IN_PROGRESS.value:
				action_name = AW_WORKER_PROPOSALS.ACTIONS.COMPLETE_WORK;
				break;
			default:
				toastStore.add('Proposal is not in a state to complete work', TOAST_TYPES.WARNING);
				return;
		}
		let actions = [
			{
				account: AW_WORKER_PROPOSALS.CONTRACT_NAME,
				name: action_name,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					proposal_id: selectedProposal.proposal_id,
					dac_id: $activePlanetStore.scope
				}
			}
		];
		await pushActions($session, actions).then(() => {
			refresh();
		});
	}

	async function onDispute() {
		if (!$session) {
			toastStore.add('Please login to vote', TOAST_TYPES.WARNING);
			return;
		}
		let action_name = '';
		switch (selectedProposal.state) {
			case AW_WORKER_PROPOSALS.PROP_STATE.PENDING_FINALIZE.value:
				action_name = AW_WORKER_PROPOSALS.ACTIONS.DISPUTE_UNAPPROVED_PROPOSAL;
				break;
			default:
				toastStore.add('Proposal is not in a state to dispute', TOAST_TYPES.WARNING);
				return;
		}
		let actions = [
			{
				account: AW_WORKER_PROPOSALS.CONTRACT_NAME,
				name: action_name,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					proposal_id: selectedProposal.proposal_id,
					dac_id: $activePlanetStore.scope
				}
			}
		];
		await pushActions($session, actions).then(() => {
			refresh();
		});
	}

	async function onFinalize() {
		if (!$session) {
			toastStore.add('Please login to vote', TOAST_TYPES.WARNING);
			return;
		}
		let action_name = '';
		switch (selectedProposal.state) {
			case AW_WORKER_PROPOSALS.PROP_STATE.PENDING_FINALIZE.value:
			case AW_WORKER_PROPOSALS.PROP_STATE.HAS_ENOUGH_FIN_VOTES.value:
				action_name = AW_WORKER_PROPOSALS.ACTIONS.FINALIZE_PROPOSAL;
				break;
			default:
				toastStore.add('Proposal is not in a state to finalize', TOAST_TYPES.WARNING);
				return;
		}
		let actions = [
			{
				account: AW_WORKER_PROPOSALS.CONTRACT_NAME,
				name: action_name,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					proposal_id: selectedProposal.proposal_id,
					dac_id: $activePlanetStore.scope
				}
			}
		];
		await pushActions($session, actions).then(() => {
			refresh();
		});
	}

	async function onClearExpired() {
		if (!$session) {
			toastStore.add('Please login to vote', TOAST_TYPES.WARNING);
			return;
		}
		let action_name = '';
		switch (selectedProposal.state) {
			case AW_WORKER_PROPOSALS.PROP_STATE.EXPIRED.value:
				action_name = AW_WORKER_PROPOSALS.ACTIONS.CLEAR_EXPIRED_PROPOSAL;
				break;
			default:
				toastStore.add('Proposal is not in a state to finalize', TOAST_TYPES.WARNING);
				return;
		}
		let actions = [
			{
				account: AW_WORKER_PROPOSALS.CONTRACT_NAME,
				name: action_name,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					proposal_id: selectedProposal.proposal_id,
					dac_id: $activePlanetStore.scope
				}
			}
		];
		await pushActions($session, actions).then(() => {
			refresh();
		});
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
				<button
					class="min-w-8 basis-1/4 rounded-xl bg-indigo-500 p-2 text-sm font-bold text-white hover:bg-indigo-700"
					on:click|stopPropagation={() => {
						showActions = false;
						onNewProposal();
					}}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					New Proposal
				</button>

				<!-- {#if enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.VOTE_PROPOSAL) || enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.VOTE_FINISH_PROPOSAL)} -->
				<button
					class:hidden={!(
						enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.VOTE_PROPOSAL) ||
						enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.VOTE_FINISH_PROPOSAL)
					)}
					class="min-w-8 basis-1/4 rounded-xl bg-green-500 p-2 text-sm font-bold text-white hover:bg-green-700"
					on:click|stopPropagation={() => onVote(AW_WORKER_PROPOSALS.VOTE.VOTE_APPROVE.value)}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Approve
				</button>
				<button
					class:hidden={!(
						enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.VOTE_PROPOSAL) ||
						enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.VOTE_FINISH_PROPOSAL)
					)}
					class="min-w-8 basis-1/4 rounded-xl bg-red-500 p-2 text-sm font-bold text-white hover:bg-red-700"
					on:click|stopPropagation={() => onVote(AW_WORKER_PROPOSALS.VOTE.VOTE_DENY.value)}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Deny
				</button>
				<!-- {/if} -->
				<!-- {#if enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.ARBITATOR_AGREE)} -->
				<button
					class:hidden={!enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.ARBITATOR_AGREE)}
					class="min-w-8 basis-1/4 rounded-xl bg-blue-500 p-2 text-sm font-bold text-white hover:bg-green-700"
					on:click|stopPropagation={() => onArbiterAgree()}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Agree
				</button>
				<!-- {/if} -->
				<!-- {#if enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.ARBIRATOR_VOTE)} -->
				<button
					class:hidden={!enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.ARBIRATOR_VOTE)}
					class="min-w-8 basis-1/4 rounded-xl bg-green-500 p-2 text-sm font-bold text-white hover:bg-green-700"
					on:click|stopPropagation={() =>
						onArbiterVote(AW_WORKER_PROPOSALS.VOTE.VOTE_APPROVE.value)}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Approve
				</button>
				<button
					class:hidden={!enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.ARBIRATOR_VOTE)}
					class="min-w-8 basis-1/4 rounded-xl bg-red-500 p-2 text-sm font-bold text-white hover:bg-red-700"
					on:click|stopPropagation={() => onArbiterVote(AW_WORKER_PROPOSALS.VOTE.VOTE_DENY.value)}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Deny
				</button>
				<!-- {/if} -->
				<!-- {#if enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.CANCEL_PROPOSAL) || enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.CANCEL_WIP_PROPOSAL)} -->
				<button
					class:hidden={!(
						enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.CANCEL_PROPOSAL) ||
						enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.CANCEL_WIP_PROPOSAL)
					)}
					class="min-w-8 basis-1/4 rounded-xl bg-gray-500 p-2 text-sm font-bold text-white hover:bg-gray-700"
					on:click|stopPropagation={() => onCancel()}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Cancel
				</button>
				<!-- {/if} -->
				<!-- {#if enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.START_WORK)} -->
				<button
					class:hidden={!enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.START_WORK)}
					class="min-w-8 basis-1/4 rounded-xl bg-blue-500 p-2 text-sm font-bold text-white hover:bg-blue-700"
					on:click|stopPropagation={() => onStartWork()}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Start Work
				</button>
				<!-- {/if} -->
				<!-- {#if enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.COMPLETE_WORK)} -->
				<button
					class:hidden={!enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.COMPLETE_WORK)}
					class="min-w-8 basis-1/4 rounded-xl bg-teal-500 p-2 text-sm font-bold text-white hover:bg-teal-700"
					on:click|stopPropagation={() => onCompleteWork()}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Complete
				</button>
				<!-- {/if} -->
				<!-- {#if enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.DISPUTE_UNAPPROVED_PROPOSAL)} -->
				<button
					class:hidden={!enableActions.includes(
						AW_WORKER_PROPOSALS.ACTIONS.DISPUTE_UNAPPROVED_PROPOSAL
					)}
					class="min-w-8 basis-1/4 rounded-xl bg-purple-500 p-2 text-sm font-bold text-white hover:bg-purple-700"
					on:click|stopPropagation={() => onDispute()}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Dispute
				</button>
				<!-- {/if} -->
				<!-- {#if enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.FINALIZE_PROPOSAL)} -->
				<button
					class:hidden={!enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.FINALIZE_PROPOSAL)}
					class="min-w-8 basis-1/4 rounded-xl bg-yellow-500 p-2 text-sm font-bold text-white hover:bg-yellow-700"
					on:click|stopPropagation={() => onFinalize()}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Finalize
				</button>
				<!-- {/if} -->
				<!-- {#if enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.CLEAR_EXPIRED_PROPOSAL)} -->
				<button
					class:hidden={!enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.CLEAR_EXPIRED_PROPOSAL)}
					class="min-w-8 basis-1/4 rounded-xl bg-red-500 p-2 text-sm font-bold text-white hover:bg-red-700"
					on:click|stopPropagation={() => onClearExpired()}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Clear
				</button>
				<!-- {/if} -->
			</div>
		</div>
	{/if}
	{#if $session}
		<div class="mt-5 hidden max-w-32 flex-wrap justify-center md:flex">
			<button
				class="m-1 min-w-32 grow rounded-xl bg-indigo-500 p-2 font-bold text-white hover:bg-indigo-700"
				on:click={() => onNewProposal()}
			>
				New Proposal
			</button>

			<!-- <button
				class="min-w-32 rounded-xl bg-green-500 px-3 py-2 font-bold text-white hover:bg-green-700"
				on:click={() => onDelegate(true)}
			>
				Delegate
			</button>
			<button
				class="min-w-32 rounded-xl bg-red-500 px-3 py-2 font-bold text-white hover:bg-red-700"
				on:click={() => onDelegate(false)}
			>
				Undelegate
			</button> -->

			{#if enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.VOTE_PROPOSAL) || enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.VOTE_FINISH_PROPOSAL)}
				<button
					class="m-1 min-w-32 grow rounded-xl bg-green-500 p-2 font-bold text-white hover:bg-green-700"
					on:click={() => onVote(AW_WORKER_PROPOSALS.VOTE.VOTE_APPROVE.value)}
				>
					Approve
				</button>
				<button
					class="m-1 min-w-32 grow rounded-xl bg-red-500 p-2 font-bold text-white hover:bg-red-700"
					on:click={() => onVote(AW_WORKER_PROPOSALS.VOTE.VOTE_DENY.value)}
				>
					Deny
				</button>
			{/if}
			{#if enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.ARBITATOR_AGREE)}
				<button
					class="m-1 min-w-32 grow rounded-xl bg-blue-500 p-2 font-bold text-white hover:bg-green-700"
					on:click={() => onArbiterAgree()}
				>
					Agree
				</button>
			{/if}
			{#if enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.ARBIRATOR_VOTE)}
				<button
					class="m-1 min-w-32 grow rounded-xl bg-green-500 p-2 font-bold text-white hover:bg-green-700"
					on:click={() => onArbiterVote(AW_WORKER_PROPOSALS.VOTE.VOTE_APPROVE.value)}
				>
					Approve
				</button>
				<button
					class="m-1 min-w-32 grow rounded-xl bg-red-500 p-2 font-bold text-white hover:bg-red-700"
					on:click={() => onArbiterVote(AW_WORKER_PROPOSALS.VOTE.VOTE_DENY.value)}
				>
					Deny
				</button>
			{/if}

			{#if enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.CANCEL_PROPOSAL) || enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.CANCEL_WIP_PROPOSAL)}
				<button
					class=" m-1 min-w-32 grow rounded-xl bg-gray-500 p-2 font-bold text-white hover:bg-gray-700"
					on:click={() => onCancel()}
				>
					Cancel
				</button>
			{/if}

			{#if enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.START_WORK)}
				<button
					class="m-1 min-w-32 grow rounded-xl bg-blue-500 p-2 font-bold text-white hover:bg-blue-700"
					on:click={() => onStartWork()}
				>
					Start Work
				</button>
			{/if}
			{#if enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.COMPLETE_WORK)}
				<button
					class="m-1 min-w-32 grow rounded-xl bg-teal-500 p-2 font-bold text-white hover:bg-teal-700"
					on:click={() => onCompleteWork()}
				>
					Complete
				</button>
			{/if}

			{#if enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.DISPUTE_UNAPPROVED_PROPOSAL)}
				<button
					class="m-1 min-w-32 grow rounded-xl bg-purple-500 p-2 font-bold text-white hover:bg-purple-700"
					on:click={() => onDispute()}
				>
					Dispute
				</button>
			{/if}

			{#if enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.FINALIZE_PROPOSAL)}
				<button
					class="m-1 min-w-32 grow rounded-xl bg-yellow-500 p-2 font-bold text-white hover:bg-yellow-700"
					on:click={() => onFinalize()}
				>
					Finalize
				</button>
			{/if}
			{#if enableActions.includes(AW_WORKER_PROPOSALS.ACTIONS.CLEAR_EXPIRED_PROPOSAL)}
				<button
					class="m-1 min-w-32 grow rounded-xl bg-red-500 p-2 font-bold text-white hover:bg-red-700"
					on:click={() => onClearExpired()}
				>
					Clear
				</button>
			{/if}
		</div>
	{:else}
		<p class="mt-5 text-center">Login to call actions</p>
	{/if}
</div>

<style>
	.test {
		grid-column-start: 3;
	}
</style>
