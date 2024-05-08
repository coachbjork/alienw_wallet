<script lang="ts">
	import { goto } from '$app/navigation';
	import { AW_DAO, AW_MSIG, TOAST_TYPES } from '$lib/constants';
	import { get_msig_proposal_by_id } from '$lib/services/awMsigPropService';
	import { activePlanetStore, custodiansStore, session, toastStore } from '$lib/stores';
	import { getAccountOnchain } from '$lib/utils/wharfkit/accountKit';
	import { pushActions } from '$lib/utils/wharfkit/session';
	import { ABI, Serializer } from '@wharfkit/antelope';
	import { CommandOutline } from 'flowbite-svelte-icons';
	import { afterUpdate, createEventDispatcher, onMount } from 'svelte';
	import { cubicIn, cubicOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';

	export let selectedProposal: any = {};
	export let ableToClaimBudget: any = false;

	let enableActions: any = [];
	let new_proposal_name: string = '';
	let planetDAO_permissions: string[] = [];
	const dispatch = createEventDispatcher();
	let showActions = false;

	onMount(async () => {
		setEnableActions();
		await generateRandomProposalId();
		if ($activePlanetStore) {
			await getAccountInstance($activePlanetStore.account);
		}
		// const packedTransaction = PackedTransaction.from({
		// 	packed_trx:
		// 		'11a60a6600000000000000000000018053bc9483a95c34000000572d3ccdcd01000032094ce3b68100000000a8ed323248000032094ce3b68100009086039780f8c0e1e4000000000004544c4d000000002747616c6163746963313233204b617669616e2e576f726c642053636176656e6765722048756e7400'
		// });

		// const transaction = packedTransaction.getTransaction();
		// console.log(transaction);
		// console.log(transaction.expiration.toDate());

		// for (let action of transaction.actions) {
		// 	console.log(action);
		// 	const d = action.decoded;
		// 	console.log(d.data);
		// 	console.log(action.abi?.toJSON());
		// 	console.log(String(action.name));
		// 	const typedAction = Action.from(action);
		// 	const client = new APIClient({ url: get(bpRPCStore) });
		// 	const { abi } = await client.v1.chain.get_abi(String(action.account));
		// 	console.log(abi);
		// 	const decoded = typedAction.decodeData(action.abi);

		// 	console.log(decoded);
		// }
	});

	afterUpdate(async () => {
		setEnableActions();
		await generateRandomProposalId();
	});

	function refresh() {
		dispatch('refresh');
	}

	function setEnableActions() {
		if ($session) {
			enableActions = [];

			if (selectedProposal) {
				enableActions.push(AW_MSIG.ACTIONS.APPROVE);
				enableActions.push(AW_MSIG.ACTIONS.UNAPPROVE);
				if (selectedProposal?.approved_by.length >= 3) {
					enableActions.push(AW_MSIG.ACTIONS.EXECUTE);
				}
				if (
					selectedProposal?.proposer == String($session.actor) &&
					selectedProposal?.proposal_status == AW_MSIG.PROP_STATE.PENDING.value
				) {
					enableActions.push(AW_MSIG.ACTIONS.CANCEL);
				}
				enableActions.push(AW_MSIG.ACTIONS.PROPOSE);
			}
			if ($custodiansStore.find((c) => c.cust_name == String($session?.actor))) {
				enableActions.push(AW_DAO.ACTIONS.CLAIM_BUDGET);
			}
		} else {
			enableActions = [];
		}
	}

	async function generateRandomProposalId() {
		const characters = '12345abcdefghijklmnopqrstuvwxyz';
		let proposal_name = '';
		let proposal_name_exists = false;
		while (!proposal_name_exists) {
			proposal_name = '';
			for (let i = 0; i < 12; i++) {
				proposal_name += characters.charAt(Math.floor(Math.random() * characters.length));
			}
			const res: any = await get_msig_proposal_by_id($activePlanetStore.name, proposal_name);

			// If it does, generate a new one
			// If it doesn't, set proposal_name_exists to true
			if (!res?.proposal_name) {
				proposal_name_exists = true;
			}
		}
		new_proposal_name = proposal_name;
	}

	async function getAccountInstance(account: string) {
		const dao_instance: any = await getAccountOnchain(account);
		planetDAO_permissions = dao_instance.data.permissions.map((item: any) =>
			String(item.perm_name)
		);
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
		await pushActions($session, actions).then(() => {
			refresh();
		});
	}

	async function onProposeClaimBudget() {
		if (!$session) {
			toastStore.add('Please login to call action', TOAST_TYPES.WARNING);
			return;
		}
		const abi = ABI.from({
			structs: [
				{
					name: 'claimbudget',
					base: '',
					fields: [
						{
							name: 'dac_id',
							type: 'name'
						}
					]
				}
			]
		});

		let actions = [
			{
				account: AW_MSIG.CONTRACT_NAME,
				name: AW_MSIG.ACTIONS.PROPOSE,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					proposer: String($session.actor),
					proposal_name: new_proposal_name,
					requested: [
						{
							actor: $activePlanetStore.account,
							permission: planetDAO_permissions[0]
						}
					],
					dac_id: $activePlanetStore.scope,
					metadata: [],
					trx: {
						actions: [
							{
								account: AW_DAO.CONTRACT_NAME,
								name: AW_DAO.ACTIONS.CLAIM_BUDGET,
								authorization: [
									{
										actor: $activePlanetStore.account,
										permission: planetDAO_permissions[0]
									}
								],

								data: Serializer.encode({
									object: {
										dac_id: $activePlanetStore.scope
									},
									abi,
									type: 'claimbudget'
								})
							}
						],
						context_free_actions: [],
						delay_sec: 0,
						// expiration is 7 days from now
						expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('.')[0],
						max_cpu_usage_ms: 0,
						max_net_usage_words: 0,
						ref_block_num: 0,
						ref_block_prefix: 0,
						transaction_extensions: []
					}
				}
			}
		];
		await pushActions($session, actions).then(() => {
			refresh();
		});
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
		await pushActions($session, actions).then(() => {
			refresh();
		});
	}

	function navigateToMsigCreate(isCopy: boolean = false) {
		if (isCopy) {
			const data = {
				actions: selectedProposal.actions,
				proposal_title: selectedProposal.proposal_title,
				description: selectedProposal.description
			};

			goto('/msig/create', { state: { data } });
		} else goto('/msig/create');
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
					on:click={() => navigateToMsigCreate()}
					class=" min-w-8 basis-1/4 truncate text-wrap rounded-xl bg-indigo-500 p-2 text-center text-sm font-bold text-white hover:bg-indigo-700"
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					New Msig
				</button>
				<!-- {#if selectedProposal} -->
				<button
					class:hidden={!selectedProposal}
					on:click={() => navigateToMsigCreate(true)}
					class="min-w-8 basis-1/4 truncate text-wrap rounded-xl bg-gray-500 p-2 text-center text-sm font-bold text-white hover:bg-gray-700"
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Clone Msig
				</button>
				<!-- {/if} -->

				<!-- {#if enableActions.includes(AW_DAO.ACTIONS.CLAIM_BUDGET)} -->
				<button
					class:hidden={!enableActions.includes(AW_DAO.ACTIONS.CLAIM_BUDGET)}
					class={`min-w-8 basis-1/4 truncate text-wrap rounded-xl bg-teal-500 p-2 text-sm font-bold text-white  ${
						!ableToClaimBudget ? 'opacity-50' : 'hover:bg-teal-700'
					}`}
					disabled={!ableToClaimBudget}
					on:click={() => onProposeClaimBudget()}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Claim Budget
				</button>
				<!-- {/if} -->
				<!-- {#if enableActions.includes(AW_MSIG.ACTIONS.APPROVE)} -->
				<button
					class:hidden={!enableActions.includes(AW_MSIG.ACTIONS.APPROVE)}
					class="min-w-8 basis-1/4 truncate text-wrap rounded-xl bg-green-500 p-2 text-sm font-bold text-white hover:bg-green-700"
					on:click={() => onApprove()}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Approve
				</button>
				<!-- {/if} -->
				<!-- {#if enableActions.includes(AW_MSIG.ACTIONS.UNAPPROVE)} -->
				<button
					class:hidden={!enableActions.includes(AW_MSIG.ACTIONS.UNAPPROVE)}
					class="min-w-8 basis-1/4 truncate text-wrap rounded-xl bg-yellow-500 p-2 text-sm font-bold text-white hover:bg-yellow-700"
					on:click={() => onRevoke()}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Unapprove
				</button>
				<!-- {/if} -->
				<!-- {#if enableActions.includes(AW_MSIG.ACTIONS.EXECUTE)} -->
				<button
					class:hidden={!enableActions.includes(AW_MSIG.ACTIONS.EXECUTE)}
					class="min-w-8 basis-1/4 truncate text-wrap rounded-xl bg-blue-500 p-2 text-sm font-bold text-white hover:bg-blue-700"
					on:click={() => onExecute()}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Execute
				</button>
				<!-- {/if} -->
				<!-- {#if enableActions.includes(AW_MSIG.ACTIONS.CANCEL)} -->
				<button
					class:hidden={!enableActions.includes(AW_MSIG.ACTIONS.CANCEL)}
					class="min-w-8 basis-1/4 truncate text-wrap rounded-xl bg-red-500 p-2 text-sm font-bold text-white hover:bg-red-700"
					on:click={() => onCancel()}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Cancel
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
				New Msig
			</button>
			{#if selectedProposal}
				<button
					on:click={() => navigateToMsigCreate(true)}
					class="m-1 min-w-32 grow rounded-xl bg-gray-500 p-2 text-center font-bold text-white hover:bg-gray-700"
					type="button"
				>
					Clone Msig
				</button>
			{/if}

			{#if enableActions.includes(AW_DAO.ACTIONS.CLAIM_BUDGET)}
				<button
					class={`m-1 min-w-32 grow rounded-xl bg-teal-500 p-2 font-bold text-white  ${
						!ableToClaimBudget ? 'opacity-50' : 'hover:bg-teal-700'
					}`}
					disabled={!ableToClaimBudget}
					on:click={() => onProposeClaimBudget()}
				>
					Claim Budget
				</button>
			{/if}
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
					Unapprove
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
					class="m-1 min-w-32 grow rounded-xl bg-red-500 p-2 font-bold text-white hover:bg-red-700"
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
