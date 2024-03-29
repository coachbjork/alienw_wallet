<script lang="ts">
	import { page } from '$app/stores';
	import PlanetMenu from '$lib/components/Menu/PlanetMenu.svelte';
	import { AW, AW_MSIG, TOAST_TYPES } from '$lib/constants';
	import { get_msig_proposal_by_id } from '$lib/services/awMsigPropService';
	import { activePlanetStore, custodiansStore, session, toastStore } from '$lib/stores';
	import type { Authorization, Planet, Transaction_Action } from '$lib/types';
	import { getAccountOnchain } from '$lib/utils/wharfkit/accountKit';
	import { getActionsOfSmartContract } from '$lib/utils/wharfkit/contractKit';
	import { pushActions } from '$lib/utils/wharfkit/session';
	import { ABI, Serializer } from '@wharfkit/antelope';
	import { ArrowLeftOutline, CirclePlusSolid, CloseCircleSolid } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';

	let loading = true;
	let selectedPlanet: Planet = $activePlanetStore;
	$: selectedPlanet !== $activePlanetStore && updateData();
	let new_proposal_name: string = '';
	let expired_at: string = new Date(
		new Date().getTime() - new Date().getTimezoneOffset() * 60000 + 7 * 24 * 60 * 60 * 1000
	)
		.toISOString()
		.slice(0, 16);

	let requested_approvals: Authorization[] = [];
	let metadata: any = [];
	let actions: Transaction_Action[] = [];
	let planetDAO_permissions: string[] = [];
	let title = '- No Title -';
	let description = '- No Description -';
	let custom_metadata = false;
	let custom_requested_approvals = false;

	onMount(async () => {
		if ($activePlanetStore) {
			requested_approvals = [
				{
					actor: $activePlanetStore ? $activePlanetStore.account : '',
					permission: planetDAO_permissions[0] ? planetDAO_permissions[0] : ''
				}
			];
			await getAccountInstance($activePlanetStore.account);
			requested_approvals = [
				{
					actor: $activePlanetStore ? $activePlanetStore.account : '',
					permission: planetDAO_permissions[0] ? planetDAO_permissions[0] : ''
				}
			];
		}
		await generateRandomProposalId();
		// metadata = [
		// 	{
		// 		key: 'Title',
		// 		value: ''
		// 	},
		// 	{
		// 		key: 'Description',
		// 		value: ''
		// 	}
		// ];
		if ($page.state?.data) {
			await updateCloneData();
		}
		loading = false;
	});

	async function updateData() {
		{
			loading = true;
			selectedPlanet = $activePlanetStore;
			expired_at = new Date(
				new Date().getTime() - new Date().getTimezoneOffset() * 60000 + 7 * 24 * 60 * 60 * 1000
			)
				.toISOString()
				.slice(0, 16);
			await getAccountInstance($activePlanetStore.account);
			requested_approvals = [
				{
					actor: $activePlanetStore ? $activePlanetStore.account : '',
					permission: planetDAO_permissions[0] ? planetDAO_permissions[0] : ''
				}
			];
			actions = [];
			if ($page.state?.data) {
				await updateCloneData();
			}
			await generateRandomProposalId();
			loading = false;
		}
	}

	async function updateCloneData() {
		const { data } = $page.state;
		title = data.proposal_title;
		description = data.description;

		let clone_actions = [];

		for (let item of data.actions) {
			const sc_actions = await getActionsOfSmartContract(item.contract_name);
			let action = Object.assign(
				{},
				sc_actions.find((i: any) => i.name === item.action_name)
			);
			action.authorization = [
				{
					actor: $activePlanetStore ? $activePlanetStore.account : '',
					permission: planetDAO_permissions[0] ? planetDAO_permissions[0] : ''
				}
			];

			clone_actions.push({
				action,
				data: item.action_data,
				sc_account: item.contract_name,
				sc_actions
			});
		}
		actions = clone_actions;
	}

	function autoResize(event: any) {
		event.target.style.height = 'auto'; // Reset height to recalculate
		event.target.style.height = event.target.scrollHeight + 'px'; // Set new height
	}

	function resetHeight(event: any) {
		event.target.style.height = 'auto'; // Reset height to recalculate
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
				actor: $activePlanetStore ? $activePlanetStore.account : '',
				permission: planetDAO_permissions[0] ? planetDAO_permissions[0] : ''
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

	async function new_transferTLM_action() {
		actions = [
			{
				sc_account: AW.CONTRACT_NAME,
				action: { name: '', fields: [], authorization: [], base: '' },
				sc_actions: AW.ACTIONS,
				data: {}
			}
		];
		on_change_action_name('transfer', actions.length - 1);
		actions[actions.length - 1].data = {
			from: $activePlanetStore ? $activePlanetStore.account : '',
			to: '',
			quantity: '',
			memo: ''
		};
	}

	function new_multi_transfer_action() {
		title = 'CWA';
		description = 'CWA';
		actions = [];
		for (let custodian of $custodiansStore) {
			actions = [
				...actions,
				{
					sc_account: AW.CONTRACT_NAME,
					action: { name: '', fields: [], authorization: [], base: '' },
					sc_actions: AW.ACTIONS,
					data: {}
				}
			];
			on_change_action_name('transfer', actions.length - 1);
			actions[actions.length - 1].data = {
				from: $activePlanetStore ? $activePlanetStore.account : '',
				to: custodian.cust_name,
				quantity: '',
				memo: 'CWA'
			};
		}
	}

	function remove_action(index: number) {
		actions = actions.filter((_, i) => i !== index);
	}

	async function getAccountInstance(account: string) {
		const dao_instance: any = await getAccountOnchain(account);
		planetDAO_permissions = dao_instance.data.permissions.map((item: any) =>
			String(item.perm_name)
		);
	}

	async function on_change_sc_account(index: number) {
		const data = await getActionsOfSmartContract(actions[index].sc_account);
		actions[index].action = { name: '', fields: [], authorization: [], base: '' };
		actions[index].data = {};
		actions[index].sc_actions = data;
	}

	function on_change_action_name(value: any, index: number) {
		if (value === '') {
			// reset action and data
			actions[index].action = { name: '', fields: [], authorization: [], base: '' };
			actions[index].data = {};
			return;
		}
		let action = Object.assign(
			{},
			actions[index].sc_actions.find((item) => item.name === value)
		);
		action.authorization = [
			{
				actor: $activePlanetStore ? $activePlanetStore.account : '',
				permission: planetDAO_permissions[0] ? planetDAO_permissions[0] : ''
			}
		];
		actions[index].action = action;
	}

	function on_change_approval_permission(value: any, index: number) {
		requested_approvals[index].permission = value;
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
				// JSON.parse all attributes of data

				Object.keys(item.data).forEach((key) => {
					try {
						item.data[key] = JSON.parse(item.data[key]);
					} catch (error) {}
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
		// new_metadata with all key as lowercase
		let new_metadata = metadata.map((item: any) => {
			return {
				key: item.key.toLowerCase(),
				value: item.value
			};
		});
		new_metadata = [
			{
				key: 'title',
				value: title
			},
			{
				key: 'description',
				value: description
			},
			...new_metadata
		];
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
					metadata: new_metadata,
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
		<div class="flex flex-row items-center justify-center">
			<a href="/msig">
				<ArrowLeftOutline class="h-14 w-14 text-indigo-400 hover:contrast-200 " />
			</a>
			<!-- Title of the feature -->
			<h1 class="mx-auto my-4 text-2xl font-bold text-orange-500">Create A New Msig</h1>
		</div>

		{#if $session}
			<div class="mx-auto flex w-2/3 flex-col gap-y-2 rounded-lg border p-5">
				<div class="flex flex-row">
					<div class="flex w-2/3 flex-col">
						<label for="title" class="text-base font-semibold"> Title </label>
						<input
							type="text"
							id="title"
							name="title"
							bind:value={title}
							class="mt-1 rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
						/>
					</div>
					<div class="ml-3 flex w-1/3 flex-col">
						<label for="proposer" class="text-base font-semibold"> Proposer </label>
						<input
							type="text"
							id="proposer"
							name="proposer"
							bind:value={$session.actor}
							class="mt-1 rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
							disabled
						/>
					</div>
				</div>
				<div class=" flex w-full flex-col">
					<label for="description" class="text-base font-semibold"> Description </label>
					<textarea
						rows="9"
						bind:value={description}
						class="w-full rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
						placeholder="Enter Value"
						on:input={autoResize}
						on:focusin={() => autoResize(event)}
						on:focusout={() => resetHeight(event)}
					/>
				</div>
				{#if custom_metadata && metadata.length > 0}
					<!-- Metadata -->
					<div class="mt-1 flex flex-col">
						{#each metadata as pair, index}
							<div class="mt-1 flex flex-row">
								<div class="flex w-1/3 flex-col">
									{#if index == 0}
										<label for="key" class="text-base font-semibold"> Key </label>
									{/if}
									<input
										type="text"
										bind:value={pair.key}
										class=" rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
										placeholder="Key"
									/>
								</div>
								<div class="flex w-1/2 flex-col">
									{#if index == 0}
										<label for="value" class="text-base font-semibold"> Value </label>
									{/if}
									<textarea
										rows="1"
										bind:value={pair.value}
										class="ml-1 w-full rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
										placeholder="Value"
										on:input={autoResize}
										on:focusin={() => autoResize(event)}
										on:focusout={() => resetHeight(event)}
									/>
								</div>
								{#if index > 0}
									<button
										on:click={() => {
											remove_metadata(index);
										}}
									>
										<CloseCircleSolid class="ml-2 h-6 w-6 text-red-500" />
									</button>
								{/if}
							</div>
						{/each}
					</div>
				{/if}

				<!-- text and checkbox to allow add custom metadata -->
				<div class="flex h-6 flex-row items-center">
					<label for="custom_metadata" class="text-sm italic"> Add custom metadata </label>
					<input
						type="checkbox"
						id="custom_metadata"
						name="custom_metadata"
						class="ml-2 rounded-lg"
						bind:checked={custom_metadata}
						on:change={(event) => {
							if (!event?.target?.checked) {
								metadata = [];
							}
						}}
					/>
					{#if custom_metadata}
						<button
							class="ml-3 rounded-lg bg-gray-500 p-1 text-center text-xs text-white hover:bg-gray-700"
							on:click={() => {
								new_metadata();
							}}
						>
							Add
						</button>
					{/if}
				</div>

				<div class="flex w-full flex-row place-content-between">
					<!-- Request Approvals -->
					<div class="mt-3 flex flex-col">
						{#each requested_approvals as requested, index}
							<div class="mt-1 flex flex-row flex-wrap">
								<div class="flex flex-col">
									{#if index == 0}
										<label for="planet" class="text-base font-semibold"> Planet </label>
									{/if}
									<input
										type="text"
										bind:value={requested.actor}
										class=" rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
										placeholder="Account Name"
									/>
								</div>
								<div class="ml-1 flex flex-col">
									{#if index == 0}
										<label for="planet-permission" class="text-base font-semibold">
											Permission
										</label>
									{/if}
									<select
										id={`request_approval_${index}`}
										name={`request_approval_${index}`}
										bind:value={requested.permission}
										on:change={(event) => {
											on_change_approval_permission(event?.target?.value, index);
										}}
										class="rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
									>
										<option value="" selected>Select a permission...</option>
										{#each planetDAO_permissions as item}
											<option value={item}>{item}</option>
										{/each}
									</select>
								</div>
								{#if index > 0}
									<button
										on:click={() => {
											remove_request_approval(index);
										}}
									>
										<CloseCircleSolid class="ml-2 h-6 w-6 text-red-500" />
									</button>
								{/if}
							</div>
						{/each}
					</div>
					<!-- expired date at -->
					<div class="mt-3 flex flex-col">
						<label for="expired_at" class="text-base font-semibold"> Expired At </label>
						<input
							type="datetime-local"
							id="expired_at"
							name="expired_at"
							bind:value={expired_at}
							class="mt-1 rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
						/>
					</div>
				</div>
				<div class="flex h-6 flex-row items-center">
					<label for="custom_requested_approvals" class=" text-sm italic">
						Add custom approvals
					</label>
					<input
						type="checkbox"
						id="custom_requested_approvals"
						name="custom_requested_approvals"
						class=" ml-2 rounded-lg"
						bind:checked={custom_requested_approvals}
						on:change={(event) => {
							if (!event?.target?.checked) {
								requested_approvals = [
									{
										actor: $activePlanetStore ? $activePlanetStore.account : '',
										permission: planetDAO_permissions[0] ? planetDAO_permissions[0] : ''
									}
								];
							}
						}}
					/>
					{#if custom_requested_approvals}
						<button
							class="ml-3 rounded-lg bg-gray-500 p-1 text-center text-xs text-white hover:bg-gray-700"
							on:click={() => {
								new_request_approval();
							}}
						>
							Add
						</button>
					{/if}
				</div>

				<!-- Action Data -->
				<div class="mt-3 flex flex-col">
					<div class=" flex w-full flex-row border-b border-gray-500">
						<label for="action-data" class="text-base font-semibold">msig Action(s) </label>
						<!-- Icon add -->
						<!-- <button
							on:click={() => {
								new_action();
							}}
						>
							<CirclePlusSolid class="ml-2 h-6 w-6 text-indigo-500" />
						</button> -->
					</div>
					<div class="mt-1 flex flex-row">
						<button
							class="rounded-lg bg-gray-500 p-1 text-center text-base text-white hover:bg-gray-700"
							on:click={() => {
								new_transferTLM_action();
							}}
						>
							Transfer TLM
						</button>
						<button
							class="ml-2 rounded-lg bg-gray-500 p-1 text-center text-base text-white hover:bg-gray-700"
							on:click={() => {
								new_multi_transfer_action();
							}}
						>
							Multi Transfer
						</button>
						<button
							class="ml-2 rounded-lg bg-gray-500 p-1 text-center text-base text-white hover:bg-gray-700"
							on:click={() => {
								new_action();
							}}
						>
							Custom Action
						</button>
					</div>
					{#each actions as action, index}
						<label
							for="action"
							class="mt-1 w-full border-t border-gray-500 text-base italic underline"
						>
							Action {index + 1}
						</label>
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
								class=" ml-1 mt-1 rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
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
								<CloseCircleSolid class="ml-2 h-6 w-6 text-red-500" />
							</button>
						</div>
						<!-- Fields -->
						<div class="ml-10 mt-3 flex flex-col">
							{#if action.action.fields.length > 0}
								<!-- <label for="fields" class="text-base font-semibold">Fields </label> -->
								<!-- List all fields -->
								{#each action.action.fields as field, index2}
									<label for={`field_${index}_${index2}`} class="mt-1 text-base italic underline">
										{field.name}
									</label>
									<div class="flex flex-row">
										<textarea
											rows="1"
											id={`field_${index}_${index2}`}
											name={`field_${index}_${index2}`}
											bind:value={action.data[field.name]}
											class="mt-1 w-full resize rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
											placeholder={field.name}
											on:input={autoResize}
											on:focusin={() => autoResize(event)}
											on:focusout={() => resetHeight(event)}
										/>
										<span
											class="ml-1 mt-1 flex items-center justify-center rounded-lg bg-gray-600 px-2 text-white"
										>
											{field.type}
										</span>
									</div>
								{/each}
							{/if}
						</div>
						<!-- Action Authorization -->
						{#if action.action.authorization.length > 0}
							<div class="mb-3 ml-10 mt-3 flex flex-col">
								<div class="flex flex-row">
									<label for="authorization" class="text-base font-semibold"> Authorization </label>
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
											class="ml-1 rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
											placeholder="Permission Name"
										/>

										<button
											on:click={() => {
												remove_action_auth(index, auth_index);
											}}
										>
											<CloseCircleSolid class="ml-2 h-6 w-6 text-red-500" />
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
