<script lang="ts">
	import { AW, AW_STAKE, TOAST_TYPES } from '$lib/constants';
	import { session, toastStore } from '$lib/stores';
	import { pushActions } from '$lib/utils/wharfkit/session';
	import { Asset } from '@wharfkit/antelope';
	import { Spinner } from 'flowbite-svelte';
	import CloseOutline from 'flowbite-svelte-icons/CloseOutline.svelte';
	import { createEventDispatcher, onMount } from 'svelte';

	const dispatch = createEventDispatcher();
	let isOpen = false;
	let isSubmitting = false;
	let selectedItem: any = null;
	let title = 'Stake';
	let isStake = true;
	let quantity = 0;
	let symbolName = '';
	let symbolPrecision = 0;

	export let tlm_balance: any = Asset.from('0.0000 TLM');

	export function setModalOpen(bool: boolean, data: any) {
		selectedItem = data.selectedItem;
		symbolName = data.selectedItem?.balance?.symbol?.name;
		symbolPrecision = data.selectedItem?.balance?.symbol?.precision;
		title = data.isStake ? 'Stake' : 'Unstake';
		isStake = data.isStake;
		isOpen = bool;
	}

	function refresh() {
		dispatch('refresh');
	}

	onMount(async () => {});

	async function submit() {
		isSubmitting = true;
		if (!$session) {
			toastStore.add('Please login to vote', TOAST_TYPES.WARNING);
			return;
		}

		if (!quantity) {
			toastStore.add('Quantity is required', TOAST_TYPES.WARNING);
			isSubmitting = false;
			return;
		}

		let actions: any = [
			{
				account: AW.CONTRACT_NAME,
				name: AW.ACTIONS.TRANSFER,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					from: String($session.actor),
					to: AW_STAKE.CONTRACT_NAME,
					quantity: `${quantity.toFixed(symbolPrecision)} ${isStake ? 'TLM' : symbolName}`,
					memo: isStake ? 'staking' : 'Unstaking'
				}
			}
		];
		if (isStake) {
			actions.push({
				account: AW_STAKE.CONTRACT_NAME,
				name: AW_STAKE.ACTIONS.STAKE,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					account: String($session.actor),
					planet_name: selectedItem?.planet_name,
					quantity: `${quantity.toFixed(symbolPrecision)} ${symbolName}`
				}
			});
		}
		const res = await pushActions($session, actions);
		if (res) {
			isSubmitting = false;
			refresh();
			close();
		} else {
			isSubmitting = false;
		}
	}

	async function close() {
		selectedItem = null;
		isStake = true;
		isSubmitting = false;
		quantity = 0;
		isOpen = false;
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
{#if isOpen}
	<div class="modal" on:click={close}>
		<div class="modal-content bg-background-default-lighter" on:click|stopPropagation>
			<div class="mb-5 flex flex-row">
				<h2 class=" text-white underline decoration-white underline-offset-4">
					{title}
				</h2>
				<div class="flex-grow"></div>
				<CloseOutline
					class="text-red-500 hover:cursor-pointer"
					size="lg"
					strokeWidth="3"
					on:click={close}
				/>
			</div>
			<div class="flex flex-row place-content-between">
				<label for="title" class="text-base font-semibold"> Quantity: </label>
				<span
					class=" mr-2 flex cursor-default items-center justify-center text-indigo-500 underline"
					on:click={() => {
						if (isStake) {
							quantity = tlm_balance.value;
						} else {
							quantity = selectedItem?.staked?.value;
						}
					}}>Max</span
				>
			</div>
			<div class="flex flex-row">
				<input
					id="title"
					class="text-black"
					type="number"
					bind:value={quantity}
					placeholder="Quantity"
				/>
				<span
					class="my-2 ml-1 flex items-center justify-center rounded-lg bg-gray-600 px-2 text-white"
				>
					{isStake ? 'TLM' : symbolName}
				</span>
			</div>

			<div class="mt-2">
				{#if isSubmitting}
					<!-- Spining wheel when uploading -->
					<div class="flex flex-col items-center">
						<Spinner color="green" />
					</div>
				{:else}
					<button class="bg-green-500 text-white hover:bg-green-700" on:click={submit}
						>Submit</button
					>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal {
		position: fixed;
		z-index: 100;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		overflow: auto;
		background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
		display: flex;
		align-items: baseline;
		justify-content: center;
	}

	.modal-content {
		margin: auto;
		padding: 15px;
		border: 1px solid #888;
		width: 50%;
		max-width: 300px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		border-radius: 8px;
	}

	input,
	textarea {
		width: 100%;
		margin: 8px 0;
		display: inline-block;
		border: 1px solid #ccc;
		border-radius: 4px;
		box-sizing: border-box;
		font-size: 16px;
	}

	button {
		width: 100%;
		padding: 14px 20px;
		margin: 8px 0;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 16px;
	}
</style>
