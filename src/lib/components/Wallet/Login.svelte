<script lang="ts">
	import { browser } from '$app/environment';
	import { allSessions, session } from '$lib/stores';
	import { Chains, Session, SessionKit } from '@wharfkit/session';
	import { TransactPluginAutoCorrect } from '@wharfkit/transact-plugin-autocorrect';
	import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor';
	import { WalletPluginCleos } from '@wharfkit/wallet-plugin-cleos';
	import { WalletPluginCloudWallet } from '@wharfkit/wallet-plugin-cloudwallet';
	import WebRenderer from '@wharfkit/web-renderer';
	import { onMount } from 'svelte';
	import Icon from 'svelte-awesome';
	import trash from 'svelte-awesome/icons/trash';

	let sessionKit: SessionKit;

	if (browser) {
		sessionKit = new SessionKit(
			{
				appName: 'alienwallet',
				chains: [Chains.WAX],
				ui: new WebRenderer(),
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
				console.log('restored', restored);
				console.log('allRestoreds', allRestoreds);

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
		console.log('all session', $allSessions);
	}

	async function logout() {
		await sessionKit.logout();
		session.set(null);
		allSessions.set([]);
	}

	let showDropdown = false;

	function toggleDropdown() {
		showDropdown = !showDropdown;
	}

	async function selectUser(account: Session) {
		// await sessionKit.persistSession(account, true);
		session.set(account);
	}

	async function removeUser(account: Session) {
		await sessionKit.logout(account);
		allSessions.set($allSessions.filter((a) => a.actor !== account.actor));
		if ($allSessions.length === 0) {
			await logout();
		}
	}

	// function preventClose(event:any) {
	// 	event.stopPropagation();
	// }
</script>

<div class="p-2">
	{#if $session}
		<div class="dropdown-container">
			<span on:click={toggleDropdown}>{$session.actor}</span>
			{#if showDropdown}
				<div class="dropdown">
					{#each $allSessions as account}
						<div class="flex flex-row">
							<button on:click={() => selectUser(account)}>{account.actor}</button>
							<button
								on:click={() => {
									console.log('here');
									removeUser(account);
								}}
							>
								<Icon data={trash} class="m-2 text-red-500" />
							</button>
						</div>
					{/each}
					<button on:click={addAccount}>Add Account</button>
					<button on:click={logout}>Logout</button>
				</div>
			{/if}
		</div>
	{:else}
		<button class="mr-2 hidden text-base font-bold md:inline" on:click={login}>Login</button>
	{/if}
</div>

<style>
	.dropdown-container {
		position: relative;
		display: inline-block;
	}
	.dropdown {
		display: none;
		position: absolute;
		/* Additional styles for positioning and appearance */
	}
	.dropdown-container:hover .dropdown,
	.dropdown-container:focus-within .dropdown {
		display: block;
	}
</style>
