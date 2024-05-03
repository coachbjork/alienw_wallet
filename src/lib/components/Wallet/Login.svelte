<script lang="ts">
	import { browser } from '$app/environment';
	import { allSessions, bpRPCStore, session } from '$lib/stores';
	import { Session, SessionKit } from '@wharfkit/session';
	import { TransactPluginAutoCorrect } from '@wharfkit/transact-plugin-autocorrect';
	import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor';
	import { WalletPluginCleos } from '@wharfkit/wallet-plugin-cleos';
	import { WalletPluginCloudWallet } from '@wharfkit/wallet-plugin-cloudwallet';
	import WebRenderer from '@wharfkit/web-renderer';
	import AngleDownOutline from 'flowbite-svelte-icons/AngleDownOutline.svelte';
	import { onMount } from 'svelte';
	import Icon from 'svelte-awesome';
	import trash from 'svelte-awesome/icons/trash';

	let sessionKit: SessionKit;
	let showDropdown = false;

	if (browser) {
		sessionKit = new SessionKit(
			{
				appName: 'alienwallet',
				chains: [
					{
						id: '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4',
						url: $bpRPCStore
					}
				],
				ui: new WebRenderer({ minimal: true }),
				walletPlugins: [
					new WalletPluginCloudWallet(),
					new WalletPluginAnchor(),
					new WalletPluginCleos()
				]
			},
			{ transactPlugins: [new TransactPluginAutoCorrect()] }
		);
		onMount(async () => {
			try {
				const restored = await sessionKit.restore();
				const allRestoreds = await sessionKit.restoreAll();

				if (restored) {
					session.set(restored);
				}
				if (allRestoreds) {
					allSessions.set(allRestoreds);
				}
			} catch (e) {
				console.log('error caught in onMount', e);
			}
		});
	}

	async function login() {
		const response = await sessionKit.login();
		session.set(response.session);
		allSessions.set([response.session]);
	}

	async function addAccount() {
		const response = await sessionKit.login();
		session.set(response.session);
		allSessions.set([...$allSessions, response.session]);
	}

	async function logout() {
		await sessionKit.logout();
		session.set(null);
		allSessions.set([]);
	}

	function activeDropdown() {
		showDropdown = !showDropdown;
		if (showDropdown) {
			// When the dropdown is shown, add an event listener to the window
			window.addEventListener('click', handleWindowClick);
		}
	}

	function handleWindowClick(event: any) {
		// If the clicked element is not part of the dropdown, hide the dropdown
		if (!event.target.closest('.wallet-dropdown-container')) {
			showDropdown = false;
			window.removeEventListener('click', handleWindowClick);
		}
	}

	async function selectUser(account: Session) {
		session.set(account);
		sessionKit.persistSession(account);
	}

	async function removeUser(account: Session) {
		await sessionKit.logout(account);
		allSessions.set($allSessions.filter((a) => a.actor !== account.actor));
		if ($allSessions.length === 0) {
			await logout();
		}
	}
</script>

<div class="p-2">
	{#if $session}
		<div class="wallet-dropdown-container">
			<button on:click={activeDropdown}>
				<span class=" rounded-lg border border-indigo-500 px-4 py-1"
					>{$session.actor}
					<!-- <Icon data={caretDown} /> -->
					<AngleDownOutline class="pointer-events-none inline-block" size="sm" />
				</span>
			</button>
			{#if showDropdown}
				<div class="dropdown">
					{#each $allSessions as account}
						<div class="flex flex-row">
							<button on:click={() => selectUser(account)}>{account.actor} </button>
							<button
								on:click={() => {
									removeUser(account);
								}}
							>
								<Icon data={trash} class="text-red-500" />
							</button>
						</div>
					{/each}
					<button
						on:click={addAccount}
						class="rounded-none border-t-2 border-solid"
						style="border-color: rgb(165, 236, 248, 0.4);">Add Account</button
					>
					<button on:click={logout} class="text-red-500">Logout</button>
				</div>
			{/if}
		</div>
	{:else}
		<button on:click={login}>
			<span
				class=" hover:from-indigo-950 rounded-lg border-2 border-solid border-indigo-800 px-4 py-1 hover:bg-gradient-to-r hover:to-blue-800"
				>Login</span
			></button
		>
	{/if}
</div>

<style>
	.wallet-dropdown-container {
		position: relative;
		display: inline-block;
	}
	.dropdown {
		position: absolute;
		left: -10px;
		margin-top: 20px; /* Adjusted for padding */
		background-color: #13215b; /* Light background for the dropdown */
		box-shadow: 0px 8px 16px 0px rgba(114, 112, 207, 0.2); /* Add some shadow for depth */
		z-index: 1; /* Ensure it's above other items */
		border-radius: 5px; /* Rounded corners */
		width: 200px; /* Set a fixed width */
	}

	.dropdown button {
		display: block;
		width: 100%; /* Make buttons expand to the full width */
		text-align: left; /* Align text to the left */
		background-color: transparent; /* Transparent background */
		padding: 4px 20px; /* Padding inside buttons */
		cursor: pointer; /* Change mouse cursor on hover */
	}
</style>
