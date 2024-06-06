<script lang="ts">
	import { base } from '$app/paths';
	import PlanetMenu from '$lib/components/Menu/PlanetMenu.svelte';
	import { AW, AW_REFERENDUM, TOAST_TYPES } from '$lib/constants';
	import { get_deposited_bal, get_ref_cfg } from '$lib/services/awReferendumService';
	import { activePlanetStore, session, toastStore } from '$lib/stores';
	import type { Authorization, Planet, Transaction_Action } from '$lib/types';
	import { getAccountOnchain } from '$lib/utils/wharfkit/accountKit';
	import { encodeAction, getActionsOfSmartContract } from '$lib/utils/wharfkit/contractKit';
	import { pushActions } from '$lib/utils/wharfkit/session';
	import { Asset, Name } from '@wharfkit/antelope';
	import { ArrowLeftOutline, CirclePlusSolid, CloseCircleSolid } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';

	let loading = true;
	let selectedPlanet: Planet = $activePlanetStore;
	let userDeposited: any = null;
	let config: any = {};
	let requested_approvals: Authorization[] = [];
	let actions: Transaction_Action[] = [];
	let planetDAO_permissions: string[] = [];
	let title = '- No Title -';
	let content = '- No Content -';
	let type_name = AW_REFERENDUM.REF_TYPE.OPINION.value;
	let voting_type_name = AW_REFERENDUM.COUNT_TYPE.ACCOUNT.value;

	$: selectedPlanet !== $activePlanetStore && updateData();
	$: $session && fetchUserDepositedBal();

	onMount(async () => {
		if ($activePlanetStore) {
			requested_approvals = [
				{
					actor: $activePlanetStore ? $activePlanetStore.account : '',
					permission: planetDAO_permissions[0] ? planetDAO_permissions[0] : ''
				}
			];
			await getAccountInstance($activePlanetStore.account);
			await fetchRefCfgs();
			requested_approvals = [
				{
					actor: $activePlanetStore ? $activePlanetStore.account : '',
					permission: planetDAO_permissions[0] ? planetDAO_permissions[0] : ''
				}
			];
		}

		loading = false;
	});

	async function updateData() {
		{
			loading = true;
			selectedPlanet = $activePlanetStore;
			await getAccountInstance($activePlanetStore.account);
			await fetchRefCfgs();
			requested_approvals = [
				{
					actor: $activePlanetStore ? $activePlanetStore.account : '',
					permission: planetDAO_permissions[0] ? planetDAO_permissions[0] : ''
				}
			];
			actions = [];
			if ($session) {
				await fetchUserDepositedBal();
			}
			loading = false;
		}
	}

	async function fetchUserDepositedBal() {
		if (!$session) return;
		let response = await get_deposited_bal(String($session.actor));
		// let response = await get_deposited_bal('5thba.wam');
		if (!response) return;
		userDeposited = response;
	}

	async function fetchRefCfgs() {
		let response = await get_ref_cfg($activePlanetStore.name);
		if (!response) return;
		config = response;
	}

	function autoResize(event: any) {
		event.target.style.height = 'auto'; // Reset height to recalculate
		event.target.style.height = event.target.scrollHeight + 'px'; // Set new height
	}

	function resetHeight(event: any) {
		event.target.style.height = 'auto'; // Reset height to recalculate
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
				sc_actions: AW.ACTIONS_ABI,
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

	// function new_multi_transfer_action() {
	// 	title = 'CWA';
	// 	content = 'CWA';
	// 	actions = [];
	// 	for (let custodian of $custodiansStore) {
	// 		actions = [
	// 			...actions,
	// 			{
	// 				sc_account: AW.CONTRACT_NAME,
	// 				action: { name: '', fields: [], authorization: [], base: '' },
	// 				sc_actions: AW.ACTIONS_ABI,
	// 				data: {}
	// 			}
	// 		];
	// 		on_change_action_name('transfer', actions.length - 1);
	// 		actions[actions.length - 1].data = {
	// 			from: $activePlanetStore ? $activePlanetStore.account : '',
	// 			to: custodian.cust_name,
	// 			quantity: '',
	// 			memo: 'CWA'
	// 		};
	// 	}
	// }

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

	async function onCreateRef() {
		if (!$session) {
			toastStore.add('Please login to call action', TOAST_TYPES.WARNING);
			return;
		}

		if (!config.fee) {
			toastStore.add(`The planet hasn't setup creation config yet.`, TOAST_TYPES.WARNING);
			return;
		}

		let actions_data: any = [];
		for (let item of actions) {
			try {
				let object_data = Object.assign({}, item.data);
				Object.keys(object_data).forEach((key) => {
					try {
						object_data[key] = JSON.parse(object_data[key]);
					} catch (error) {}
				});

				const typedAction = await encodeAction(
					Name.from(item.sc_account),
					Name.from(item.action.name),
					item.action.authorization,
					object_data
				);
				actions_data.push(typedAction);
				// return typedAction;
			} catch (error: any) {
				toastStore.add(`Error encoding action data: ${error.message}`, TOAST_TYPES.WARNING);
				return;
			}
		}
		let tx_actions = [];
		if (!userDeposited.account || !userDeposited.deposit) {
			if (!config.fee[type_name].quantity.units.equals(0)) {
				tx_actions.push({
					account: config.fee[type_name].contract,
					name: 'transfer',
					authorization: [
						{
							actor: String($session.actor),
							permission: String($session?.permission)
						}
					],
					data: {
						from: String($session.actor),
						to: AW_REFERENDUM.CONTRACT_NAME,
						quantity: String(config.fee[type_name].quantity),
						memo: 'Deposit for referendum creation'
					}
				});
			}
		} else if (
			userDeposited?.deposit?.contract != config.fee[type_name]?.contract ||
			userDeposited?.deposit?.quantity.symbol.name != config.fee[type_name]?.quantity.symbol.name ||
			userDeposited?.deposit?.quantity.symbol.precision !=
				config.fee[type_name]?.quantity.symbol.precision
		) {
			// Different or null deposited token => refund first
			tx_actions.push({
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
			});
			if (!config.fee[type_name].quantity.units.equals(0)) {
				tx_actions.push({
					account: config.fee[type_name].contract,
					name: 'transfer',
					authorization: [
						{
							actor: String($session.actor),
							permission: String($session?.permission)
						}
					],
					data: {
						from: String($session.actor),
						to: AW_REFERENDUM.CONTRACT_NAME,
						quantity: String(config.fee[type_name].quantity),
						memo: 'Deposit for referendum creation'
					}
				});
			}
		} else if (
			userDeposited &&
			parseInt(userDeposited?.deposit?.quantity.units) <
				parseInt(config.fee[type_name]?.quantity.units)
		) {
			// Not enough deposited token => deposit more
			let diff = config.fee[type_name].quantity.units.subtracting(
				userDeposited.deposit.quantity.units
			);

			if (diff > 0) {
				let diff_quantity = Asset.fromUnits(diff, userDeposited.deposit.quantity.symbol);
				tx_actions.push({
					account: config.fee[type_name].contract,
					name: 'transfer',
					authorization: [
						{
							actor: String($session.actor),
							permission: String($session?.permission)
						}
					],
					data: {
						from: String($session.actor),
						to: AW_REFERENDUM.CONTRACT_NAME,
						quantity: String(diff_quantity),
						memo: 'Deposit for referendum creation'
					}
				});
			}
		}

		tx_actions.push({
			account: AW_REFERENDUM.CONTRACT_NAME,
			name: AW_REFERENDUM.ACTIONS.PROPOSE,
			authorization: [
				{
					actor: String($session.actor),
					permission: String($session?.permission)
				}
			],
			data: {
				proposer: String($session.actor),
				type: type_name,
				voting_type_name,
				title,
				content,
				dac_id: $activePlanetStore.scope,
				acts: actions_data
			}
		});

		await pushActions($session, tx_actions);
	}
</script>

<div class="main-content py-6">
	<div class="container">
		<PlanetMenu />
		<div class="flex flex-row items-center justify-center">
			<a href={`${base}/referendum`}>
				<ArrowLeftOutline class="h-14 w-14 text-indigo-400 hover:contrast-200 " />
			</a>
			<!-- Title of the feature -->
			<h1 class="mx-auto my-4 text-2xl font-bold text-orange-500">Create A New Referendum</h1>
		</div>

		{#if $session}
			<div class="mx-auto flex w-4/5 flex-col gap-y-4 p-5">
				<div class="flex flex-col flex-wrap gap-4 md:flex-row">
					<div class="flex grow flex-col">
						<label for="title" class="text-base font-semibold">Title</label>
						<input
							type="text"
							id="title"
							name="title"
							bind:value={title}
							class="mt-1 rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
						/>
					</div>
					<div class="flex flex-col">
						<label for="proposer" class="text-base font-semibold">Proposer</label>
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
				<div class="flex flex-col">
					<label for="content" class="text-base font-semibold">Content</label>
					<textarea
						rows="9"
						bind:value={content}
						class="mt-1 rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
						placeholder="Enter Value"
						on:input={autoResize}
						on:focusin={() => autoResize(event)}
						on:focusout={() => resetHeight(event)}
					/>
				</div>
				<div class="flex flex-col gap-4 md:flex-row">
					<div class="flex flex-1 flex-col">
						<label for="ref-type" class="text-base font-semibold">Voting Type</label>
						<select
							id="ref-type"
							name="ref-type"
							bind:value={type_name}
							on:change={(event) => {
								if (event?.target?.value) {
									type_name = event?.target?.value;
								}
							}}
							class="mt-1 rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
						>
							<option value="" selected>Select a type</option>
							<option value={AW_REFERENDUM.REF_TYPE.BINDING.value}
								>{AW_REFERENDUM.REF_TYPE.BINDING.name}</option
							>
							<option value={AW_REFERENDUM.REF_TYPE.SEMI_BINDING.value}
								>{AW_REFERENDUM.REF_TYPE.SEMI_BINDING.name}</option
							>
							<option value={AW_REFERENDUM.REF_TYPE.OPINION.value}
								>{AW_REFERENDUM.REF_TYPE.OPINION.name}</option
							>
						</select>
					</div>
					<div class="flex flex-1 flex-col">
						<label for="ref-counting-type" class="text-base font-semibold">Counting Method</label>
						<select
							id="ref-counting-type"
							name="ref-counting-type"
							bind:value={voting_type_name}
							on:change={(event) => {
								if (event?.target?.value) {
									voting_type_name = event?.target?.value;
								}
							}}
							class="mt-1 rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
						>
							<option value="" selected>Select a type</option>
							<option value={AW_REFERENDUM.COUNT_TYPE.ACCOUNT.value}
								>{AW_REFERENDUM.COUNT_TYPE.ACCOUNT.name}</option
							>
							<option value={AW_REFERENDUM.COUNT_TYPE.TOKEN.value}
								>{AW_REFERENDUM.COUNT_TYPE.TOKEN.name}</option
							>
						</select>
					</div>
				</div>
				{#if type_name != AW_REFERENDUM.REF_TYPE.OPINION.value}
					<!-- Action Data -->
					<div class="mt-4 flex flex-col">
						<div class="flex flex-row border-b border-gray-500">
							<label for="action-data" class="text-base font-semibold">Action(s)</label>
						</div>
						<div class="mt-2 flex flex-row gap-2">
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
									new_action();
								}}
							>
								Custom Action
							</button>
						</div>
						{#each actions as action, index}
							<label
								for="action"
								class="mt-1 basis-full border-t border-gray-500 text-base italic underline"
							>
								Action {index + 1}
							</label>
							<div class="mt-2 flex flex-col gap-2 md:flex-row">
								<input
									type="text"
									bind:value={action.sc_account}
									class="m-1 rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
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
									class="m-1 rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
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
									<!-- List all fields -->
									{#each action.action.fields as field, index2}
										<label for={`field_${index}_${index2}`} class="mt-1 text-base italic underline">
											{field.name}
										</label>
										<div class="flex flex-col gap-2 md:flex-row">
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
										<label for="authorization" class="text-base font-semibold">
											Authorization
										</label>
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
										<div class="mt-1 flex flex-col gap-2 md:flex-row">
											<input
												type="text"
												bind:value={auth_item.actor}
												class="m-1 rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
												placeholder="Account Name"
											/>
											<input
												type="text"
												bind:value={auth_item.permission}
												class="m-1 rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
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
				{/if}
			</div>
			<div class="mt-5 flex justify-center">
				<button
					class="rounded-lg bg-indigo-500 p-2 text-center font-bold text-white hover:bg-indigo-700"
					on:click={() => onCreateRef()}
				>
					Submit
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
