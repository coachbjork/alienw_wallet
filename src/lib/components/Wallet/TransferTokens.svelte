<script lang="ts">
	import { PUBLIC_LIGHT_API } from '$env/static/public';
	import { TOAST_TYPES } from '$lib/constants';
	import { session, toastStore } from '$lib/stores';
	import { pushActions } from '$lib/utils/wharfkit/session';
	import axios from 'axios';
	import { afterUpdate, onMount } from 'svelte';
	import { fade, slide } from 'svelte/transition';

	let loading = true;
	let userTokens: any[] = [];
	let selectedToken: any = { currency: 'WAX', amount: 0 };
	let recipient = '';
	let quantity = '';
	let memo = '';
	let isCustomToken = false;
	let customTokenSymbol = '';
	let customTokenContract = '';

	onMount(async () => {});

	afterUpdate(async () => {});

	$: $session &&
		Promise.all([fetchTokens()]).then(async () => {
			loading = false;
		});

	export async function refresh() {
		if ($session) {
			Promise.all([fetchTokens()]).then(async () => {
				loading = false;
			});
		}
	}

	async function fetchTokens() {
		loading = true;
		const response: any = await axios.get(
			`${PUBLIC_LIGHT_API}/api/balances/wax/${String($session?.actor)}`
		);
		if (!response) return;
		userTokens = response.data.balances;

		// find and selectToken with currency == 'WAX'
		const waxToken = userTokens.find((token: any) => token.currency === 'WAX');
		if (waxToken) {
			selectToken(userTokens.indexOf(waxToken));
		}
	}

	function selectToken(index: any) {
		selectedToken = userTokens[index];
	}

	async function handleTransfer() {
		// Handle the transfer logic here
		if (!$session) {
			toastStore.add('Please login first', TOAST_TYPES.WARNING);
			return;
		}

		if (!recipient) {
			toastStore.add('Please enter a recipient', TOAST_TYPES.WARNING);
			return;
		}

		if (!quantity) {
			toastStore.add('Please enter a quantity', TOAST_TYPES.WARNING);
			return;
		}

		if (isCustomToken) {
			if (!customTokenSymbol) {
				toastStore.add('Please enter a token symbol', TOAST_TYPES.WARNING);
				return;
			}
			if (!customTokenContract) {
				toastStore.add('Please enter a contract name', TOAST_TYPES.WARNING);
				return;
			}
		}

		let actions: any = [
			{
				account: isCustomToken ? customTokenContract : selectedToken.contract,
				name: 'transfer',
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					from: String($session.actor),
					to: recipient,
					quantity: `${quantity} ${isCustomToken ? customTokenSymbol : selectedToken.currency}`,
					memo: memo
				}
			}
		];

		const res = await pushActions($session, actions);

		if (res) {
			refresh();
		}
	}

	function autoResize(event: any) {
		event.target.style.height = 'auto'; // Reset height to recalculate
		event.target.style.height = event.target.scrollHeight + 'px'; // Set new height
	}

	function resetHeight(event: any) {
		event.target.style.height = 'auto'; // Reset height to recalculate
	}
</script>

<h1 class="mb-6 ml-3 text-start text-2xl font-bold text-orange-500 md:ml-0 md:text-center">
	Transfer Tokens
</h1>

{#if $session}
	<div class="text-default ml-3 flex flex-row text-lg">
		<p class="">Liquid balance:</p>
		<p class="ml-3 font-medium text-indigo-400">{selectedToken.amount}</p>
	</div>
	<div class="mx-auto flex w-2/4 flex-col gap-y-2 rounded-lg p-5">
		<div class=" flex w-full flex-col">
			<label for="recipient" class="text-base font-semibold"> Send To: </label>
			<input
				type="text"
				bind:value={recipient}
				placeholder="Recipient"
				class="mt-1 rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
			/>
		</div>
		<div class="flex flex-col flex-wrap gap-4 md:flex-row">
			<div class="flex grow flex-col">
				<label for="quantity" class="text-base font-semibold">Quantity:</label>
				<input
					type="text"
					bind:value={quantity}
					placeholder="Quantity"
					class="mt-1 rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
				/>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div
					class="ml-3 cursor-pointer text-sm italic underline"
					on:click={() => {
						quantity = selectedToken.amount;
					}}
				>
					Send entire balance
				</div>
			</div>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class=" flex size-1/3 flex-col">
				<label for="planet-permission" class="text-base font-semibold"> Token Symbol </label>
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				{#if isCustomToken}
					<input
						type="text"
						bind:value={customTokenSymbol}
						placeholder="Token Symbol"
						class="mt-1 rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
						in:fade={{ duration: 450, delay: 0 }}
					/>
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div
						class="ml-3 mt-1 cursor-pointer text-sm italic underline"
						on:click={() => {
							isCustomToken = false;
						}}
					>
						Don't use custom token
					</div>
				{:else}
					<select
						bind:value={selectedToken}
						on:change={(event) => {
							// on_change_approval_permission(event?.target?.value, index);
						}}
						class="m-1 rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
						in:fade={{ duration: 450, delay: 0 }}
					>
						<option value="Token" selected>Select Token</option>

						{#each userTokens as item}
							<option value={item}>{item.currency}</option>
						{/each}
					</select>
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div
						class="ml-3 cursor-pointer text-sm italic underline"
						on:click={() => {
							isCustomToken = true;
						}}
					>
						Use custom token
					</div>
				{/if}
			</div>
		</div>
		{#if isCustomToken}
			<div
				class=" flex w-full flex-col"
				in:slide={{ duration: 450, delay: 0 }}
				out:slide={{ duration: 450, delay: 0 }}
			>
				<label for="contract" class="text-base font-semibold"> Contract: </label>
				<input
					type="text"
					bind:value={customTokenContract}
					placeholder="Contract Name"
					class="mt-1 rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
				/>
			</div>
		{/if}
		<div class=" flex w-full flex-col">
			<label for="memo" class="text-base font-semibold"> Memo: </label>
			<textarea
				rows="2"
				bind:value={memo}
				class="w-full rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
				placeholder="Enter Transfer Memo"
				on:input={autoResize}
				on:focusin={() => autoResize(event)}
				on:focusout={() => resetHeight(event)}
			/>
		</div>
		<div class="mt-5 flex justify-center">
			<button
				on:click={handleTransfer}
				class="rounded-lg bg-indigo-500 p-2 text-center font-bold text-white hover:bg-indigo-700"
			>
				Transfer
			</button>
		</div>
	</div>
{:else}
	<p class="text-center text-2xl underline underline-offset-4">Please login first!</p>
{/if}

<style>
</style>
