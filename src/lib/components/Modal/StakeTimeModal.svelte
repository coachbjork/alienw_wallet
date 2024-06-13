<script lang="ts">
	import { AW_TOKEN, TOAST_TYPES } from '$lib/constants';
	import { session, toastStore } from '$lib/stores';
	import { pushActions } from '$lib/utils/wharfkit/session';
	import { Spinner } from 'flowbite-svelte';
	import CloseOutline from 'flowbite-svelte-icons/CloseOutline.svelte';
	import { createEventDispatcher, onMount } from 'svelte';

	const dispatch = createEventDispatcher();
	let isOpen = false;
	let isSubmitting = false;
	let selectedItem: any = null;
	let title = 'Stake';
	let isStake = true;
	let symbolName = '';
	let symbolPrecision = 0;
	let stakeTimeSelected = {
		name: '7 days',
		seconds: 604800
	};
	let stakeTimePresets = [
		{
			name: '7 days',
			seconds: 604800
		},
		{
			name: '14 days',
			seconds: 1209600
		},
		{
			name: '30 days',
			seconds: 2592000
		},
		{
			name: '60 days',
			seconds: 5184000
		},
		{
			name: '90 days',
			seconds: 7776000
		},
		{
			name: '180 days',
			seconds: 15552000
		}
	];

	export function setModalOpen(bool: boolean, data: any) {
		console.log('data', data);
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

		let actions: any = [
			{
				account: AW_TOKEN.CONTRACT_NAME,
				name: AW_TOKEN.ACTIONS.STAKE_TIME,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					account: String($session.actor),
					token_symbol: String(selectedItem?.balance?.symbol),
					unstake_time: stakeTimeSelected.seconds
				}
			}
		];

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
		isOpen = false;
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
{#if isOpen}
	<div class="modal" on:click={close}>
		<div class="modal-content bg-background-default-lighter" on:click|stopPropagation>
			<div class="mb-2 flex flex-row">
				<h2 class=" text-white underline decoration-white underline-offset-4">Set Stake Time</h2>
				<div class="flex-grow"></div>
				<CloseOutline
					class="text-red-500 hover:cursor-pointer"
					size="lg"
					strokeWidth="3"
					on:click={close}
				/>
			</div>

			{#each stakeTimePresets as preset}
				<div class="mt-3 flex flex-row items-center">
					<input
						type="radio"
						class={`rounded-lg`}
						on:click={(e) => {
							stakeTimeSelected = preset;
						}}
						value={preset.seconds}
						checked={stakeTimeSelected.seconds === preset.seconds}
					/>
					<span class=" text-default ml-3"> {preset.name} </span>
				</div>
			{/each}

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
		max-width: 200px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		border-radius: 8px;
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
