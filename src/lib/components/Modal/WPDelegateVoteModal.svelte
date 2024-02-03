<script lang="ts">
	import { AW_WORKER_PROPOSALS } from '$lib/constants';
	import { XSolid } from 'flowbite-svelte-icons';

	export let isOpen = false;
	export let isDelegate = false;
	export let onClose: () => void;
	export let onDelegate: (proposal: any) => Promise<void>;

	let proposal_id = '';
	let delegatee_custodian = '';
	let delegate_mode = AW_WORKER_PROPOSALS.DELEGATE_MODE.PROPOSAL;
	let category = '';

	async function submit() {
		let data = {};
		if (isDelegate) {
			data = {
				proposal_id,
				delegatee_custodian,
				delegate_mode,
				category
			};
		} else {
			data = {
				category
			};
		}

		await onDelegate(data).then((res: any) => {
			if (res) {
				close();
			}
		});
	}
	function close() {
		proposal_id = '';
		delegatee_custodian = '';
		delegate_mode = AW_WORKER_PROPOSALS.DELEGATE_MODE.PROPOSAL;
		category = '';
		onClose();
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
{#if isOpen}
	<div class="modal" on:click={close}>
		<div class="modal-content bg-background-default-lighter" on:click|stopPropagation>
			<div class="mb-5 flex flex-row">
				<h2 class=" text-white underline decoration-white underline-offset-4">
					{isDelegate ? 'Delegate Vote' : 'Undelegate Vote'}
				</h2>
				<div class="flex-grow"></div>
				<XSolid
					class="text-red-500 hover:cursor-pointer"
					size="lg"
					strokeWidth="3"
					on:click={close}
				/>
			</div>

			{#if isDelegate}
				<div class="mb-4 flex flex-col">
					<label for="delegateMode" class="mb-2 text-white">Mode:</label>
					<select
						id="delegateMode"
						class="rounded border border-gray-300 text-black"
						bind:value={delegate_mode}
					>
						<option value={AW_WORKER_PROPOSALS.DELEGATE_MODE.PROPOSAL}>Delegate by Proposal</option>
						<option value={AW_WORKER_PROPOSALS.DELEGATE_MODE.CATEGORY}>Delegate by Category</option>
					</select>
				</div>
			{/if}

			{#if isDelegate && delegate_mode === 'proposal'}
				<input class=" text-black" type="text" bind:value={proposal_id} placeholder="Proposal ID" />
			{/if}

			{#if delegate_mode === 'category' || !isDelegate}
				<input class=" text-black" type="number" bind:value={category} placeholder="Category Num" />
			{/if}

			{#if isDelegate}
				<input
					class="text-black"
					type="text"
					bind:value={delegatee_custodian}
					placeholder="Delegatee"
				/>
			{/if}

			<button class="bg-green-500 text-white hover:bg-green-700" on:click={submit}>Submit</button>
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
		align-items: center;
		justify-content: center;
	}

	.modal-content {
		margin: auto;
		padding: 30px;
		border: 1px solid #888;
		width: 80%;
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
