<script lang="ts">
	import { AW_TOKEN, TOAST_TYPES } from '$lib/constants';
	import { session, toastStore } from '$lib/stores';
	import { pushActions } from '$lib/utils/wharfkit/session';
	import _ from 'lodash';
	import { afterUpdate, createEventDispatcher, onMount } from 'svelte';
	import { cubicIn, cubicOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import Actions from './Actions.svelte';

	export let selectedItem: any = {};
	export let memberInfo: any = [];

	const dispatch = createEventDispatcher();
	let showActions = false;

	onMount(async () => {});

	afterUpdate(async () => {});

	function onStake(isStake: any) {
		dispatch('stake', { selectedItem, isStake });
	}

	function onStakeTime() {
		dispatch('stakeTime', { selectedItem });
	}

	function refresh() {
		dispatch('refresh');
	}

	async function onClaimRefund() {
		if (!$session) {
			toastStore.add('Please login to vote', TOAST_TYPES.WARNING);
			return;
		}

		let actions = [
			{
				account: AW_TOKEN.CONTRACT_NAME,
				name: AW_TOKEN.ACTIONS.CLAIM_UNSTAKE,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					account: String($session.actor),
					token_symbol: String(selectedItem?.balance?.symbol)
				}
			}
		];
		const res = await pushActions($session, actions);

		if (res) {
			refresh();
		}
	}

	async function onRegisterMember() {
		if (!$session) {
			toastStore.add('Please login to vote', TOAST_TYPES.WARNING);
			return;
		}
		console.log('register member', selectedItem);

		let actions = [
			{
				account: AW_TOKEN.CONTRACT_NAME,
				name: AW_TOKEN.ACTIONS.REGISTER_MEMBER,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					agreedterms: 'NA',
					dac_id: selectedItem?.dac_id,
					sender: String($session.actor)
				}
			}
		];
		const res = await pushActions($session, actions);

		if (res) {
			refresh();
		}
	}
</script>

<Actions bind:showActions>
	{#if $session && showActions}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			on:click={() => (showActions = false)}
			class:inset-0={showActions}
			class="fixed bottom-0 left-0 right-0 z-50 content-end md:hidden"
		>
			<div class="mb-20 flex flex-row flex-wrap justify-center gap-1 p-2 backdrop-blur-sm">
				<button
					class="min-w-8 basis-1/4 rounded-xl bg-indigo-500 p-2 text-sm font-bold text-white hover:bg-indigo-700"
					on:click={() => onStake(true)}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Stake
				</button>

				<button
					class="min-w-8 basis-1/4 rounded-xl bg-yellow-500 p-2 text-sm font-bold text-white hover:bg-yellow-700"
					on:click={() => onStake(false)}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Unstake
				</button>

				<button
					class="min-w-8 basis-1/4 rounded-xl bg-teal-500 p-2 text-sm font-bold text-white hover:bg-teal-700"
					on:click={() => onClaimRefund()}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Claim Refund
				</button>

				<button
					class="min-w-8 basis-1/4 rounded-xl bg-blue-500 p-2 text-sm font-bold text-white hover:bg-blue-700"
					on:click={() => onStakeTime()}
					in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
					out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
				>
					Stake Time
				</button>
				{#if !_.find(memberInfo, (info) => info.planet.scope === selectedItem?.dac_id)}
					<button
						class="min-w-8 basis-1/4 rounded-xl bg-green-500 p-2 text-sm font-bold text-white hover:bg-green-700"
						on:click={() => onRegisterMember()}
						in:slide={{ axis: 'y', duration: 100, easing: cubicIn }}
						out:slide={{ axis: 'y', duration: 100, easing: cubicOut }}
					>
						Register Member
					</button>
				{/if}
			</div>
		</div>
	{/if}
	{#if $session}
		<div class="mt-5 hidden max-w-32 flex-wrap justify-center md:flex">
			<button
				class="m-1 min-w-32 grow rounded-xl bg-indigo-500 p-2 font-bold text-white hover:bg-indigo-700"
				on:click={() => onStake(true)}
			>
				Stake
			</button>

			<button
				class="m-1 min-w-32 grow rounded-xl bg-yellow-500 p-2 font-bold text-white hover:bg-yellow-700"
				on:click={() => onStake(false)}
			>
				Unstake
			</button>

			<button
				class="m-1 min-w-32 grow rounded-xl bg-teal-500 p-2 font-bold text-white hover:bg-teal-700"
				on:click={() => onClaimRefund()}
			>
				Claim Refund
			</button>
			<button
				class="m-1 min-w-32 grow rounded-xl bg-blue-500 p-2 font-bold text-white hover:bg-blue-700"
				on:click={() => onStakeTime()}
			>
				Stake Time
			</button>
			{#if !_.find(memberInfo, (info) => info.planet.scope === selectedItem?.dac_id)}
				<button
					class="m-1 min-w-32 grow rounded-xl bg-green-500 p-2 font-bold text-white hover:bg-green-700"
					on:click={() => onRegisterMember()}
				>
					Register Member
				</button>
			{/if}
		</div>
	{:else}
		<p class="mt-5 text-center">Login to call actions</p>
	{/if}
</Actions>

<style>
</style>
