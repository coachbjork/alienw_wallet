<script lang="ts">
	import MiniMenu from '$lib/components/Menu/MiniMenu.svelte';
	import DaoCandidateModal from '$lib/components/Modal/DaoCandidateModal.svelte';
	import StakeModal from '$lib/components/Modal/StakeModal.svelte';
	import StakeTimeModal from '$lib/components/Modal/StakeTimeModal.svelte';
	import TokensAction from '$lib/components/SidePanel/Actions/TokensAction.svelte';
	import DaoCandidate from '$lib/components/Wallet/DaoCandidate.svelte';
	import Tokens from '$lib/components/Wallet/Tokens.svelte';
	import TransferTokens from '$lib/components/Wallet/TransferTokens.svelte';
	import { session } from '$lib/stores';
	import { Asset } from '@wharfkit/antelope';
	import { afterUpdate, onMount } from 'svelte';
	import ArrowsLeftRightSolid from 'svelte-awesome-icons/ArrowsLeftRightSolid.svelte';
	import CoinsSolid from 'svelte-awesome-icons/CoinsSolid.svelte';
	import PeopleGroupSolid from 'svelte-awesome-icons/PeopleGroupSolid.svelte';

	let tlm_balance: any = Asset.from('0.0000 TLM');
	let memberInfo: any = [];
	let stakeModal: any;
	let stakeTimeModal: any;
	let daoCandidateModal: any;
	let selectedBalance: any;
	let tokensRef: any;
	let transferTokensRef: any;
	let daoCandidateRef: any;
	const menuItems: any = [
		{ id: 'aw-tokens', icon: CoinsSolid, label: 'AW Tokens', logMessage: 'AW Tokens' },
		{
			id: 'tokens-transfer',
			icon: ArrowsLeftRightSolid,
			label: 'Transfer Tokens',
			logMessage: 'Transfer Tokens'
		},
		{
			id: 'dao-candidate',
			icon: PeopleGroupSolid,
			label: 'Dao Candidate Profile',
			logMessage: 'Dao Candidate'
		}
	];
	let selectedMenuId = 'aw-tokens';

	onMount(async () => {});

	afterUpdate(async () => {});

	async function refreshTokens() {
		if ($session) {
			tokensRef.refresh();
		}
	}
	async function refreshDaoCandidate() {
		if ($session) {
			daoCandidateRef.refresh();
		}
	}
	async function refreshTransferTokens() {
		if ($session) {
			transferTokensRef.refresh();
		}
	}
</script>

<div class="main-content py-6">
	<div class="container relative overflow-x-hidden">
		{#if selectedMenuId === 'aw-tokens'}
			<Tokens
				on:selectedBalance={(data) => {
					selectedBalance = data.detail;
				}}
				on:memberInfo={(data) => {
					memberInfo = data.detail;
				}}
				on:tlmBalance={(data) => {
					tlm_balance = data.detail;
				}}
				bind:this={tokensRef}
			/>
		{:else if selectedMenuId === 'dao-candidate'}
			<DaoCandidate
				on:editImgProfile={(data) => {
					daoCandidateModal.setModalOpen(true, data.detail);
				}}
				bind:this={daoCandidateRef}
			/>
		{:else if selectedMenuId === 'tokens-transfer'}
			<TransferTokens
				on:selectedBalance={(data) => {
					selectedBalance = data.detail;
				}}
				on:memberInfo={(data) => {
					memberInfo = data.detail;
				}}
				on:tlmBalance={(data) => {
					tlm_balance = data.detail;
				}}
				bind:this={transferTokensRef}
			/>
		{/if}
		<MiniMenu
			class="block w-full md:hidden"
			{menuItems}
			on:selectedItem={(data) => {
				selectedMenuId = data.detail.id;
			}}
		/>
	</div>
</div>
<div class="left-side w-full md:flex">
	<MiniMenu
		class="hidden w-full md:block"
		{menuItems}
		on:selectedItem={(data) => {
			selectedMenuId = data.detail.id;
		}}
	/>
</div>
<div class="right-side md:flex">
	{#if $session && selectedMenuId === 'aw-tokens'}
		<TokensAction
			selectedItem={selectedBalance}
			{memberInfo}
			on:stake={(data) => stakeModal.setModalOpen(true, data.detail)}
			on:stakeTime={(data) => stakeTimeModal.setModalOpen(true, data.detail)}
			on:refresh={refreshTokens}
		/>
	{/if}
</div>
{#if selectedMenuId === 'aw-tokens'}
	<StakeModal bind:this={stakeModal} on:refresh={refreshTokens} {tlm_balance} />
	<StakeTimeModal bind:this={stakeTimeModal} on:refresh={refreshTokens} />
{/if}
{#if selectedMenuId === 'dao-candidate'}
	<DaoCandidateModal bind:this={daoCandidateModal} on:refresh={refreshDaoCandidate} />
{/if}

<style>
</style>
