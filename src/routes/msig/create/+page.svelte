<script lang="ts">
	import PlanetMenu from '$lib/components/Menu/PlanetMenu.svelte';
	import { AW_MSIG, TOAST_TYPES } from '$lib/constants';
	import { get_msig_proposal_by_id } from '$lib/services/awMsigPropService';
	import { activePlanetStore, session, toastStore } from '$lib/stores';
	import type { Authorization, Planet, Transaction_Action } from '$lib/types';
	import { getActionsOfAccount } from '$lib/utils/wharfkit/contractKit';
	import { pushActions } from '$lib/utils/wharfkit/session';
	import { ABI, Serializer } from '@wharfkit/antelope';
	import { CirclePlusSolid, XCircleSolid } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';

	let loading = true;
	let selectedPlanet: Planet = $activePlanetStore;
	$: selectedPlanet !== $activePlanetStore && updateData();
	let new_proposal_name: string = '';
	let expired_at: string = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
		.toISOString()
		.slice(0, 16);
	let requested_approvals: Authorization[] = [];
	let metadata: any = [];
	let actions: Transaction_Action[] = [];

	onMount(async () => {
		await generateRandomProposalId();
		if ($session) {
			requested_approvals = [
				{
					actor: $session ? String($session.actor) : '',
					permission: $session ? String($session?.permission) : ''
				}
			];
		}
		loading = false;
	});

	async function updateData() {
		{
			loading = true;
			selectedPlanet = $activePlanetStore;
			expired_at = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
				.toISOString()
				.slice(0, 16);
			requested_approvals = [];
			new_request_approval();
			await generateRandomProposalId();
			loading = false;
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

	function new_request_approval() {
		requested_approvals = [
			...requested_approvals,
			{
				actor: '',
				permission: ''
			}
		];
	}
	function remove_request_approval(index: number) {
		requested_approvals = requested_approvals.filter((_, i) => i !== index);
	}

	function new_metadata() {
		metadata = [
			...metadata,
			{
				key: '',
				value: ''
			}
		];
	}

	function remove_metadata(index: number) {
		metadata = metadata.filter((_: any, i: number) => i !== index);
	}

	function new_action() {
		actions = [
			...actions,
			{
				sc_account: '',
				action: { name: '', fields: [], authorization: [], base: '' },
				sc_actions: [],
				data: {}
			}
		];
	}

	function remove_action(index: number) {
		actions = actions.filter((_, i) => i !== index);
	}

	async function on_change_sc_account(index: number) {
		const data = await getActionsOfAccount(actions[index].sc_account);
		actions[index].sc_actions = data;
	}

	function on_change_action_name(value: any, index: number) {
		let action = actions[index].sc_actions.find((action) => action.name === value);
		action.authorization = [
			{
				actor: '',
				permission: ''
			}
		];
		actions[index].action = action;
	}

	function new_action_auth(index: number) {
		actions[index].action.authorization = [
			...actions[index].action.authorization,
			{
				actor: '',
				permission: ''
			}
		];
	}
	function remove_action_auth(index: number, auth_index: number) {
		actions[index].action.authorization = actions[index].action.authorization.filter(
			(_, i) => i !== auth_index
		);
	}

	async function onCreateMsig() {
		if (!$session) {
			toastStore.add('Please login to call action', TOAST_TYPES.WARNING);
			return;
		}
		if (requested_approvals.length === 0) {
			toastStore.add('Please add at least one requested approval', TOAST_TYPES.WARNING);
			return;
		}
		if (actions.length === 0) {
			toastStore.add('Please add at least one action', TOAST_TYPES.WARNING);
			return;
		}

		let actions_data = actions.map((item) => {
			try {
				let abi = ABI.from({
					structs: [
						{
							name: item.action.name,
							base: item.action.base,
							fields: item.action.fields
						}
					]
				});
				let data = Serializer.encode({
					object: item.data,
					abi,
					type: item.action.name
				});
				return {
					account: item.sc_account,
					name: item.action.name,
					authorization: item.action.authorization,
					data: data
				};
			} catch (error: any) {
				toastStore.add(`Error encoding action data: ${error.message}`, TOAST_TYPES.WARNING);
			}
		});

		let tx_actions = [
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
					requested: requested_approvals,
					dac_id: $activePlanetStore.scope,
					metadata,
					trx: {
						actions: actions_data,
						context_free_actions: [],
						delay_sec: 0,
						expiration: `${expired_at}:00`,
						max_cpu_usage_ms: 0,
						max_net_usage_words: 0,
						ref_block_num: 0,
						ref_block_prefix: 0,
						transaction_extensions: []
					}
				}
			}
		];

		await pushActions($session, tx_actions);
	}
</script>

<div class="main-content py-6">
	<div class="container">
		<PlanetMenu />
		<!-- Title of the feature -->
		<h1 class="my-4 text-center text-2xl font-bold">Create A New Msig</h1>
		<!-- need label and input fields for: proposer, proposal_name -->

		{#if $session}
			<div class="mx-auto flex w-2/3 flex-col rounded-lg border border-indigo-500 p-5">
				<div class="flex flex-col">
					<label for="proposer" class="text-base font-semibold"> Proposer: </label>
					<input
						type="text"
						id="proposer"
						name="proposer"
						bind:value={$session.actor}
						class="mt-1 rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
						disabled
					/>
				</div>
				<div class="mt-3 flex flex-col">
					<label for="proposal_name" class="text-base font-semibold"> Proposal Name: </label>
					<input
						type="text"
						id="proposal_name"
						name="proposal_name"
						bind:value={new_proposal_name}
						class="mt-1 rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
						placeholder="Enter a proposal name"
					/>
				</div>
				<!-- expired date at -->
				<div class="mt-3 flex flex-col">
					<label for="expired_at" class="text-base font-semibold"> Expired At: </label>
					<input
						type="datetime-local"
						id="expired_at"
						name="expired_at"
						bind:value={expired_at}
						class="mt-1 rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
					/>
				</div>
				<!-- Request Approvals -->
				<div class="mt-3 flex flex-col">
					<div class="flex flex-row">
						<label for="expired_at" class="text-base font-semibold"> Request Approvals: </label>
						<!-- Icon add -->
						<button
							on:click={() => {
								new_request_approval();
							}}
						>
							<CirclePlusSolid class="ml-2 h-6 w-6 text-indigo-500" />
						</button>
					</div>
					{#each requested_approvals as requested, index}
						<div class="mt-1 flex flex-row">
							<input
								type="text"
								bind:value={requested.actor}
								class=" rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
								placeholder="Account Name"
							/>

							<input
								type="text"
								bind:value={requested.permission}
								class="ml-10 rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
								placeholder="Permission Name"
							/>

							<button
								on:click={() => {
									remove_request_approval(index);
								}}
							>
								<XCircleSolid class="ml-2 h-6 w-6 text-red-500" />
							</button>
						</div>
					{/each}
				</div>
				<!-- Metadata -->
				<div class="mt-3 flex flex-col">
					<div class="flex flex-row">
						<label for="expired_at" class="text-base font-semibold">Metadata: </label>
						<!-- Icon add -->
						<button
							on:click={() => {
								new_metadata();
							}}
						>
							<CirclePlusSolid class="ml-2 h-6 w-6 text-indigo-500" />
						</button>
					</div>
					{#each metadata as pair, index}
						<div class="mt-1 flex flex-row">
							<input
								type="text"
								bind:value={pair.key}
								class=" rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
								placeholder="Key"
							/>

							<input
								type="text"
								bind:value={pair.value}
								class="ml-10 rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
								placeholder="Value"
							/>

							<button
								on:click={() => {
									remove_metadata(index);
								}}
							>
								<XCircleSolid class="ml-2 h-6 w-6 text-red-500" />
							</button>
						</div>
					{/each}
				</div>
				<!-- Action Data -->
				<div class="mt-3 flex flex-col">
					<div class="flex flex-row">
						<label for="expired_at" class="text-base font-semibold">Actions: </label>
						<!-- Icon add -->
						<button
							on:click={() => {
								new_action();
							}}
						>
							<CirclePlusSolid class="ml-2 h-6 w-6 text-indigo-500" />
						</button>
					</div>
					{#each actions as action, index}
						<div class="mt-2 flex flex-row">
							<input
								type="text"
								bind:value={action.sc_account}
								class=" rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
								placeholder="Contract Account"
								on:change={() => {
									on_change_sc_account(index);
								}}
							/>
							<select
								id={`action_name_${index}`}
								name={`action_name_${index}`}
								bind:value={action.action.name}
								on:change={(event) => {
									on_change_action_name(event?.target?.value, index);
								}}
								class=" ml-10 mt-1 rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
							>
								<option value="" selected>Select an action...</option>
								{#each action.sc_actions as item}
									<option value={item.name}>{item.name}</option>
								{/each}
							</select>

							<button
								class="close-button"
								on:click={() => {
									remove_action(index);
								}}
							>
								<XCircleSolid class="ml-2 h-6 w-6 text-red-500" />
							</button>
						</div>
						<!-- Fields -->
						<div class="ml-10 mt-3 flex flex-col">
							{#if action.action.fields.length > 0}
								<label for="expired_at" class="text-base font-semibold">Fields: </label>
								<!-- List all fields -->
								{#each action.action.fields as field, index2}
									<div class="mt-1 flex flex-row">
										<input
											type="text"
											id={`field_${index}_${index2}`}
											name={`field_${index}_${index2}`}
											bind:value={action.data[field.name]}
											class="mt-1 rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
											placeholder={field.name}
										/>
									</div>
								{/each}
							{/if}
						</div>
						<!-- Action Authorization -->
						{#if action.action.authorization.length > 0}
							<div class="mb-3 ml-10 mt-3 flex flex-col">
								<div class="flex flex-row">
									<label for="expired_at" class="text-base font-semibold"> Authorization: </label>
									<!-- Icon add -->
									<button
										on:click={() => {
											new_action_auth(index);
										}}
									>
										<CirclePlusSolid class="ml-2 h-6 w-6 text-indigo-500" />
									</button>
								</div>
								{#each action.action.authorization as auth_item, auth_index}
									<div class="mt-1 flex flex-row">
										<input
											type="text"
											bind:value={auth_item.actor}
											class=" rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
											placeholder="Account Name"
										/>

										<input
											type="text"
											bind:value={auth_item.permission}
											class="ml-10 rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
											placeholder="Permission Name"
										/>

										<button
											on:click={() => {
												remove_action_auth(index, auth_index);
											}}
										>
											<XCircleSolid class="ml-2 h-6 w-6 text-red-500" />
										</button>
									</div>
								{/each}
							</div>
						{/if}
					{/each}
				</div>
			</div>
			<div class="mt-5 flex justify-center">
				<button
					class="rounded-lg bg-indigo-500 p-2 text-center font-bold text-white hover:bg-indigo-700"
					on:click={() => onCreateMsig()}
				>
					Create Msig
				</button>
			</div>
		{:else}
			<p class="text-center text-2xl underline underline-offset-4">Please login first!</p>
		{/if}
	</div>
</div>
<div class="left-side">
	<!-- {#if $session}{/if} -->
</div>
<div class="right-side">
	<!-- {#if $session}{/if} -->
</div>

<style>
</style>
