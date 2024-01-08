<script lang="ts">
	import { blockchain_endpoints } from '$lib/constants';
	import { blockchain_rpc } from '$lib/stores';
	import Icon from 'svelte-awesome';
	import gear from 'svelte-awesome/icons/gear';

	let showDropdown = false;

	function activeDropdown() {
		showDropdown = !showDropdown;
		if (showDropdown) {
			// When the dropdown is shown, add an event listener to the window
			window.addEventListener('click', handleWindowClick);
		}
	}

	function handleWindowClick(event: any) {
		// If the clicked element is not part of the dropdown, hide the dropdown
		if (!event.target.closest('.epcfg-dropdown-container')) {
			showDropdown = false;
			window.removeEventListener('click', handleWindowClick);
		}
	}

	function changeEndpoint(rpc: string) {
		blockchain_rpc.set(rpc);
	}
</script>

<div class="epcfg-dropdown-container">
	<button
		on:click={() => {
			activeDropdown();
		}}><Icon data={gear} scale={1.3} /></button
	>
	{#if showDropdown}
		<div class="dropdown">
			<label for="blockchainNode">Blockchain Node</label>
			<select
				id="blockchainNode"
				class="my-4"
				on:change={(event) => {
					if (event?.target?.value) {
						changeEndpoint(event.target.value);
					}
				}}
				bind:value={$blockchain_rpc}
			>
				{#each blockchain_endpoints as rpc}
					<option value={rpc}>{rpc}</option>
				{/each}
			</select>
		</div>
	{/if}
</div>

<style>
	.epcfg-dropdown-container {
		position: relative;
		display: inline-block;
	}
	.dropdown {
		position: absolute;
		right: -20px; /* Align the dropdown to the right edge of its container */
		margin-top: 20px;
		background-color: #13215b;
		box-shadow: 0px 8px 16px 0px rgba(114, 112, 207, 0.2);
		z-index: 1;
		border-radius: 5px;
		width: 200px;
		padding: 4px 20px; /* Padding inside buttons */
	}

	.dropdown select {
		display: block;
		width: 100%; /* Make buttons expand to the full width */
		text-align: left; /* Align text to the left */
		background-color: transparent; /* Transparent background */
		padding: 4px 20px; /* Padding inside buttons */
		cursor: pointer; /* Change mouse cursor on hover */
	}
</style>
