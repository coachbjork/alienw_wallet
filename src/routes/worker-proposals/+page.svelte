<script lang="ts">
	import { PUBLIC_PINATA_GATEWAY, PUBLIC_PINATA_GATEWAY_KEY } from '$env/static/public';
	import PlanetMenu from '$lib/components/Menu/PlanetMenu.svelte';
	import CreateWorkerProposalModal from '$lib/components/Modal/CreateWorkerProposalModal.svelte';
	import WPDelegateVoteModal from '$lib/components/Modal/WPDelegateVoteModal.svelte';
	import WorkerProposalAction from '$lib/components/SidePanel/WorkerProposalAction.svelte';
	import { AW, AW_WORKER_PROPOSALS, TOAST_TYPES } from '$lib/constants';
	import {
		get_worker_proposals,
		get_worker_proposals_cursor,
		get_workerprop_cfg
	} from '$lib/services/awWorkerPropService';
	import { activePlanetStore, session, toastStore } from '$lib/stores';
	import type { Planet } from '$lib/types';
	import { pushActions } from '$lib/utils/wharfkit/session';
	import { Spinner } from 'flowbite-svelte';
	import LabelSolid from 'flowbite-svelte-icons/LabelSolid.svelte';
	import moment from 'moment';
	import { afterUpdate, onMount } from 'svelte';

	let proposals: any = [];
	function handleMockData() {
		proposals = [
			{
				proposal_id: 'testprop1',
				proposer: 'awtesterooo1',
				arbiter: String($session ? $session.actor : 'waximusjazzz'),
				content_hash: 'QmbW6VPbuj2jUUY8UcZF4TJgYDdZfd4zEW1MWgKyQ2jJBN',
				proposal_pay: {
					contract: 'alien.worlds',
					quantity: '2.0000 TLM'
				},
				arbiter_pay: {
					contract: 'alien.worlds',
					quantity: '1.0000 TLM'
				},
				arbiter_agreed: false,
				state: 'pendingappr',
				expiry: '2023-07-28T08:49:10Z',
				job_duration: 2591000,
				category: 3,
				votes: [
					{
						vote_id: 0,
						voter: 'awtesterooo1',
						proposal_id: 'testprop1',
						category_id: null,
						vote: 'propdeny',
						delegatee: 'null',
						comment_hash: 'null'
					},
					{
						vote_id: 2,
						voter: 'awtesterooo3',
						proposal_id: 'testprop1',
						category_id: null,
						vote: '',
						delegatee: 'null',
						comment_hash: 'null'
					},
					{
						vote_id: 1,
						voter: 'awtesterooo2',
						proposal_id: 'testprop1',
						category_id: null,
						vote: 'propapprove',
						delegatee: 'null',
						comment_hash: 'null'
					}
				]
			},
			{
				proposal_id: 'testprop11',
				proposer: String($session ? $session.actor : 'waximusjazzz'),
				arbiter: 'awtesterooo2',
				content_hash: 'QmbW6VPbuj2jUUY8UcZF4TJgYDdZfd4zEW1MWgKyQ2jJBN',
				proposal_pay: {
					contract: 'alien.worlds',
					quantity: '2.0000 TLM'
				},
				arbiter_pay: {
					contract: 'alien.worlds',
					quantity: '1.0000 TLM'
				},
				arbiter_agreed: true,
				state: 'pendingappr',
				expiry: '2023-07-28T08:49:10Z',
				job_duration: 2591000,
				category: 3,
				votes: [
					{
						vote_id: 0,
						voter: 'awtesterooo1',
						proposal_id: 'testprop1',
						category_id: null,
						vote: 'propdeny',
						delegatee: 'null',
						comment_hash: 'null'
					},
					{
						vote_id: 2,
						voter: 'awtesterooo3',
						proposal_id: 'testprop1',
						category_id: null,
						vote: '',
						delegatee: 'null',
						comment_hash: 'null'
					},
					{
						vote_id: 1,
						voter: 'awtesterooo2',
						proposal_id: 'testprop1',
						category_id: null,
						vote: 'propapprove',
						delegatee: 'null',
						comment_hash: 'null'
					}
				]
			},
			{
				proposal_id: 'testprop2',
				proposer: 'awtesterooo1',
				arbiter: 'awtesterooo2',
				content_hash: 'QmbW6VPbuj2jUUY8UcZF4TJgYDdZfd4zEW1MWgKyQ2jJBN',
				proposal_pay: {
					contract: 'alien.worlds',
					quantity: '2.0000 TLM'
				},
				arbiter_pay: {
					contract: 'alien.worlds',
					quantity: '1.0000 TLM'
				},
				arbiter_agreed: true,
				state: 'apprvtes',
				expiry: '2023-07-28T08:49:10Z',
				job_duration: 2592000,
				category: 3,
				votes: [
					{
						vote_id: 0,
						voter: 'awtesterooo1',
						proposal_id: 'testprop2',
						category_id: null,
						vote: 'propapprove',
						delegatee: 'null',
						comment_hash: 'null'
					},
					{
						vote_id: 1,
						voter: 'awtesterooo2',
						proposal_id: 'testprop2',
						category_id: null,
						vote: 'propapprove',
						delegatee: 'null',
						comment_hash: 'null'
					}
				]
			},
			{
				proposal_id: 'testprop22',
				proposer: String($session ? $session.actor : 'waximusjazzz'),
				arbiter: 'awtesterooo2',
				content_hash: 'QmbW6VPbuj2jUUY8UcZF4TJgYDdZfd4zEW1MWgKyQ2jJBN',
				proposal_pay: {
					contract: 'alien.worlds',
					quantity: '2.0000 TLM'
				},
				arbiter_pay: {
					contract: 'alien.worlds',
					quantity: '1.0000 TLM'
				},
				arbiter_agreed: false,
				state: 'apprvtes',
				expiry: '2023-07-28T08:49:10Z',
				job_duration: 2592000,
				category: 3,
				votes: [
					{
						vote_id: 0,
						voter: 'awtesterooo1',
						proposal_id: 'testprop2',
						category_id: null,
						vote: 'propapprove',
						delegatee: 'null',
						comment_hash: 'null'
					},
					{
						vote_id: 1,
						voter: 'awtesterooo2',
						proposal_id: 'testprop2',
						category_id: null,
						vote: 'propapprove',
						delegatee: 'null',
						comment_hash: 'null'
					}
				]
			},
			{
				proposal_id: 'testprop3',
				proposer: 'awtesterooo1',
				arbiter: 'awtesterooo2',
				content_hash: 'QmbW6VPbuj2jUUY8UcZF4TJgYDdZfd4zEW1MWgKyQ2jJBN',
				proposal_pay: {
					contract: 'alien.worlds',
					quantity: '2.0000 TLM'
				},
				arbiter_pay: {
					contract: 'alien.worlds',
					quantity: '1.0000 TLM'
				},
				arbiter_agreed: true,
				state: 'inprogress',
				expiry: '2023-07-28T08:49:10Z',
				job_duration: 2592000,
				category: 3,
				votes: [
					{
						vote_id: 0,
						voter: 'awtesterooo1',
						proposal_id: 'testprop2',
						category_id: null,
						vote: 'propapprove',
						delegatee: 'null',
						comment_hash: 'null'
					},
					{
						vote_id: 1,
						voter: 'awtesterooo2',
						proposal_id: 'testprop2',
						category_id: null,
						vote: 'propapprove',
						delegatee: 'null',
						comment_hash: 'null'
					}
				]
			},
			{
				proposal_id: 'testprop33',
				proposer: String($session ? $session.actor : 'waximusjazzz'),
				arbiter: 'awtesterooo2',
				content_hash: 'QmbW6VPbuj2jUUY8UcZF4TJgYDdZfd4zEW1MWgKyQ2jJBN',
				proposal_pay: {
					contract: 'alien.worlds',
					quantity: '2.0000 TLM'
				},
				arbiter_pay: {
					contract: 'alien.worlds',
					quantity: '1.0000 TLM'
				},
				arbiter_agreed: true,
				state: 'inprogress',
				expiry: '2023-07-28T08:49:10Z',
				job_duration: 2592000,
				category: 3,
				votes: [
					{
						vote_id: 0,
						voter: 'awtesterooo1',
						proposal_id: 'testprop2',
						category_id: null,
						vote: 'propapprove',
						delegatee: 'null',
						comment_hash: 'null'
					},
					{
						vote_id: 1,
						voter: 'awtesterooo2',
						proposal_id: 'testprop2',
						category_id: null,
						vote: 'propapprove',
						delegatee: 'null',
						comment_hash: 'null'
					}
				]
			},
			{
				proposal_id: 'testprop4',
				proposer: 'awtesterooo1',
				arbiter: 'awtesterooo2',
				content_hash: 'QmbW6VPbuj2jUUY8UcZF4TJgYDdZfd4zEW1MWgKyQ2jJBN',
				proposal_pay: {
					contract: 'alien.worlds',
					quantity: '2.0000 TLM'
				},
				arbiter_pay: {
					contract: 'alien.worlds',
					quantity: '1.0000 TLM'
				},
				arbiter_agreed: true,
				state: 'pendingfin',
				expiry: '2023-07-28T08:49:10Z',
				job_duration: 2592000,
				category: 3,
				votes: [
					{
						vote_id: 0,
						voter: 'awtesterooo1',
						proposal_id: 'testprop2',
						category_id: null,
						vote: 'finaldeny',
						delegatee: 'null',
						comment_hash: 'null'
					},
					{
						vote_id: 1,
						voter: 'awtesterooo2',
						proposal_id: 'testprop2',
						category_id: null,
						vote: 'finalapprove',
						delegatee: 'null',
						comment_hash: 'null'
					}
				]
			},
			{
				proposal_id: 'testprop44',
				proposer: String($session ? $session.actor : 'waximusjazzz'),
				arbiter: 'awtesterooo2',
				content_hash: 'QmbW6VPbuj2jUUY8UcZF4TJgYDdZfd4zEW1MWgKyQ2jJBN',
				proposal_pay: {
					contract: 'alien.worlds',
					quantity: '2.0000 TLM'
				},
				arbiter_pay: {
					contract: 'alien.worlds',
					quantity: '1.0000 TLM'
				},
				arbiter_agreed: true,
				state: 'pendingfin',
				expiry: '2023-07-28T08:49:10Z',
				job_duration: 2592000,
				category: 3,
				votes: [
					{
						vote_id: 0,
						voter: 'awtesterooo1',
						proposal_id: 'testprop2',
						category_id: null,
						vote: 'finaldeny',
						delegatee: 'null',
						comment_hash: 'null'
					},
					{
						vote_id: 1,
						voter: 'awtesterooo2',
						proposal_id: 'testprop2',
						category_id: null,
						vote: 'finalapprove',
						delegatee: 'null',
						comment_hash: 'null'
					}
				]
			},
			{
				proposal_id: 'testprop5',
				proposer: 'awtesterooo1',
				arbiter: 'awtesterooo2',
				content_hash: 'QmbW6VPbuj2jUUY8UcZF4TJgYDdZfd4zEW1MWgKyQ2jJBN',
				proposal_pay: {
					contract: 'alien.worlds',
					quantity: '2.0000 TLM'
				},
				arbiter_pay: {
					contract: 'alien.worlds',
					quantity: '1.0000 TLM'
				},
				arbiter_agreed: true,
				state: 'apprfinvtes',
				expiry: '2023-07-28T08:49:10Z',
				job_duration: 2592000,
				category: 3,
				votes: [
					{
						vote_id: 0,
						voter: 'awtesterooo1',
						proposal_id: 'testprop2',
						category_id: null,
						vote: 'finalapprove',
						delegatee: 'null',
						comment_hash: 'null'
					},
					{
						vote_id: 1,
						voter: 'awtesterooo2',
						proposal_id: 'testprop2',
						category_id: null,
						vote: 'finalapprove',
						delegatee: 'null',
						comment_hash: 'null'
					}
				]
			},
			{
				proposal_id: 'testprop6',
				proposer: 'awtesterooo1',
				arbiter: 'awtesterooo2',
				content_hash: 'QmbW6VPbuj2jUUY8UcZF4TJgYDdZfd4zEW1MWgKyQ2jJBN',
				proposal_pay: {
					contract: 'alien.worlds',
					quantity: '2.0000 TLM'
				},
				arbiter_pay: {
					contract: 'alien.worlds',
					quantity: '1.0000 TLM'
				},
				arbiter_agreed: true,
				state: 'expired',
				expiry: '2023-07-28T08:49:10Z',
				job_duration: 2592000,
				category: 3
			},
			{
				proposal_id: 'testprop7',
				proposer: 'awtesterooo1',
				arbiter: String($session ? $session.actor : 'waximusjazzz'),
				content_hash: 'QmbW6VPbuj2jUUY8UcZF4TJgYDdZfd4zEW1MWgKyQ2jJBN',
				proposal_pay: {
					contract: 'alien.worlds',
					quantity: '2.0000 TLM'
				},
				arbiter_pay: {
					contract: 'alien.worlds',
					quantity: '1.0000 TLM'
				},
				arbiter_agreed: true,
				state: 'indispute',
				expiry: '2023-07-28T08:49:10Z',
				job_duration: 2592000,
				category: 3
			}
		];
	}

	let loading = true;
	let selectedPlanet: Planet = $activePlanetStore;
	let selectedProposal: any = null;
	let wpConfig: any = {};
	let proposalCursor: any = null;
	let isModalOpen = false;
	let isDelegateModalOpen = false;
	let isDelegate = false;

	onMount(async () => {
		await fetchWorkerProposals();
		await fetchWorkerProposalCfgs();
		loading = false;
	});

	afterUpdate(async () => {
		if (selectedPlanet !== $activePlanetStore) {
			selectedPlanet = $activePlanetStore;
			selectedProposal = null;
			loading = true;
			proposals = [];
			await fetchWorkerProposals();
			await fetchWorkerProposalCfgs();
			loading = false;
		}
	});

	async function fetchWorkerProposals() {
		const cursor = await get_worker_proposals_cursor($activePlanetStore.name);
		if (!cursor) return;
		proposalCursor = cursor;
		let response = await get_worker_proposals(proposalCursor, $activePlanetStore.name);
		if (!response) return;
		proposals = response;
	}

	async function fetchWorkerProposalCfgs() {
		let response = await get_workerprop_cfg($activePlanetStore.name);
		if (!response) return;
		wpConfig = response;
	}

	function selectProposal(proposal: any) {
		if (selectedProposal && selectedProposal.proposal_id == proposal.proposal_id) {
			selectedProposal = null;
			return;
		} else {
			selectedProposal = proposal;
		}
	}

	function getStateName(state: string) {
		switch (state) {
			case AW_WORKER_PROPOSALS.PROP_STATE.PENDING_APPROVAL.value:
				return AW_WORKER_PROPOSALS.PROP_STATE.PENDING_APPROVAL.name;
			case AW_WORKER_PROPOSALS.PROP_STATE.HAS_ENOUGH_APP_VOTES.value:
				return AW_WORKER_PROPOSALS.PROP_STATE.HAS_ENOUGH_APP_VOTES.name;
			case AW_WORKER_PROPOSALS.PROP_STATE.IN_PROGRESS.value:
				return AW_WORKER_PROPOSALS.PROP_STATE.IN_PROGRESS.name;
			case AW_WORKER_PROPOSALS.PROP_STATE.PENDING_FINALIZE.value:
				return AW_WORKER_PROPOSALS.PROP_STATE.PENDING_FINALIZE.name;
			case AW_WORKER_PROPOSALS.PROP_STATE.HAS_ENOUGH_FIN_VOTES.value:
				return AW_WORKER_PROPOSALS.PROP_STATE.HAS_ENOUGH_FIN_VOTES.name;
			case AW_WORKER_PROPOSALS.PROP_STATE.EXPIRED.value:
				return AW_WORKER_PROPOSALS.PROP_STATE.EXPIRED.name;
			case AW_WORKER_PROPOSALS.PROP_STATE.DISPUTED.value:
				return AW_WORKER_PROPOSALS.PROP_STATE.DISPUTED.name;
			default:
				return 'Unknown';
		}
	}

	function getApprovalState(proposal: any) {
		if (
			proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.PENDING_APPROVAL.value ||
			proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.HAS_ENOUGH_APP_VOTES.value ||
			proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.IN_PROGRESS.value
		) {
			// calculate how many approved vote
			let approvedVotes = proposal.votes.filter(
				(item: any) => item.vote == AW_WORKER_PROPOSALS.VOTE.VOTE_PROP_APPROVE.value
			);
			return `(${approvedVotes.length}/${wpConfig.proposal_threshold})`;
		} else if (
			proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.PENDING_FINALIZE.value ||
			proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.HAS_ENOUGH_FIN_VOTES.value
		) {
			// calculate how many approved vote
			let approvedVotes = proposal.votes.filter(
				(item: any) => item.vote == AW_WORKER_PROPOSALS.VOTE.VOTE_FINAL_APPROVE.value
			);
			return `(${approvedVotes.length}/${wpConfig.finalize_threshold})`;
		} else {
			return '';
		}
	}

	function getApprovedBy(proposal: any) {
		if (
			proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.PENDING_APPROVAL.value ||
			proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.HAS_ENOUGH_APP_VOTES.value ||
			proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.IN_PROGRESS.value
		) {
			let approvedByString = proposal.votes
				.filter((item: any) => item.vote == AW_WORKER_PROPOSALS.VOTE.VOTE_PROP_APPROVE.value)
				.map((item: any) => item.voter)
				.join(', ');
			return approvedByString;
		} else if (
			proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.PENDING_FINALIZE.value ||
			proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.HAS_ENOUGH_FIN_VOTES.value
		) {
			let approvedByString = proposal.votes
				.filter((item: any) => item.vote == AW_WORKER_PROPOSALS.VOTE.VOTE_FINAL_APPROVE.value)
				.map((item: any) => item.voter)
				.join(', ');
			return approvedByString;
		} else {
			return '';
		}
	}

	function getDeniedBy(proposal: any) {
		if (
			proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.PENDING_APPROVAL.value ||
			proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.HAS_ENOUGH_APP_VOTES.value ||
			proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.IN_PROGRESS.value
		) {
			let deniedByString = proposal.votes
				.filter((item: any) => item.vote == AW_WORKER_PROPOSALS.VOTE.VOTE_PROP_DENY.value)
				.map((item: any) => item.voter)
				.join(', ');
			return deniedByString;
		} else if (
			proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.PENDING_FINALIZE.value ||
			proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.HAS_ENOUGH_FIN_VOTES.value
		) {
			let deniedByString = proposal.votes
				.filter((item: any) => item.vote == AW_WORKER_PROPOSALS.VOTE.VOTE_FINAL_DENY.value)
				.map((item: any) => item.voter)
				.join(', ');
			return deniedByString;
		} else {
			return '';
		}
	}

	function getAbstainedBy(proposal: any) {
		let abstainedByString = proposal.votes
			.filter((item: any) => item.vote === '')
			.map((item: any) => item.voter)
			.join(', ');
		return abstainedByString;
	}

	function secondsToHHMM(seconds: number) {
		let hours = Math.floor(seconds / 3600);
		let minutes = Math.floor((seconds - hours * 3600) / 60);
		let secondsLeft = seconds - hours * 3600 - minutes * 60;
		let formatted = '';
		if (hours > 0) {
			formatted += hours + 'h ';
		}
		if (minutes > 0) {
			formatted += minutes + 'm ';
		}
		if (secondsLeft > 0) {
			formatted += secondsLeft + 's';
		}
		return formatted;
	}

	function handleNewProposal(event: any) {
		isModalOpen = true;
	}

	function handleDelegate(event: any) {
		isDelegateModalOpen = true;
		isDelegate = event?.detail?.is_delegate;
	}

	async function handleCreateProposalAction(proposal: any) {
		if (!$session) {
			toastStore.add('Please login to vote', TOAST_TYPES.WARNING);
			return;
		}

		const { title, summary, arbiter, proposal_pay, arbiter_pay, content_hash, id, job_duration } =
			proposal;

		let actions = [
			{
				account: AW_WORKER_PROPOSALS.CONTRACT_NAME,
				name: AW_WORKER_PROPOSALS.ACTIONS.CREATE_PROPOSAL,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					proposer: String($session.actor),
					title,
					summary,
					arbiter,
					proposal_pay: {
						quantity: `${proposal_pay.toFixed(4)} TLM`,
						contract: AW.CONTRACT_NAME
					},
					arbiter_pay: {
						quantity: `${arbiter_pay.toFixed(4)} TLM`,
						contract: AW.CONTRACT_NAME
					},
					content_hash,
					id,
					category: 0,
					job_duration,
					dac_id: $activePlanetStore.scope
				}
			}
		];
		return pushActions($session, actions);
	}

	function closeModal() {
		isModalOpen = false;
	}

	async function handleDelegateAction(data: any) {
		if (!$session) {
			toastStore.add('Please login to vote', TOAST_TYPES.WARNING);
			return;
		}

		const { proposal_id, delegatee_custodian, delegate_mode, category } = data;
		let action_name = delegate_mode
			? delegate_mode == AW_WORKER_PROPOSALS.DELEGATE_MODE.PROPOSAL
				? AW_WORKER_PROPOSALS.ACTIONS.DELEGATE_VOTE
				: AW_WORKER_PROPOSALS.ACTIONS.DELEGATE_VOTE_CATEGORY
			: AW_WORKER_PROPOSALS.ACTIONS.UNDELEGATE_VOTE;
		let actionData = delegate_mode
			? delegate_mode == AW_WORKER_PROPOSALS.DELEGATE_MODE.PROPOSAL
				? { proposal_id, delegatee_custodian }
				: { category, delegatee_custodian }
			: { category };
		let actions = [
			{
				account: AW_WORKER_PROPOSALS.CONTRACT_NAME,
				name: action_name,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					...actionData,
					custodian: $session.actor,
					dac_id: $activePlanetStore.scope
				}
			}
		];
		return pushActions($session, actions);
	}

	function closeDelegateModal() {
		isDelegateModalOpen = false;
		isDelegate = false;
	}
	// async function onVote() {
	// 	if (!$session) {
	// 		toastStore.add('Please login to vote', TOAST_TYPES.ERROR);
	// 		return;
	// 	}
	// 	let actions = [
	// 		{
	// 			account: AW_DAO.CONTRACT_NAME,
	// 			name: AW_DAO.ACTIONS.VOTE_CUSTODIANS,
	// 			authorization: [
	// 				{
	// actor: String($session.actor),
	// permission: String($session?.permission)
	// 				}
	// 			],
	// 			data: {
	// 				voter: $session.actor,
	// 				dac_id: selectedPlanet.scope,
	// 				newvotes: selectedCandidates
	// 			}
	// 		}
	// 	];
	// 	await pushActions($session, actions);
	// }
</script>

<div class="main-content py-6">
	<div class="container">
		<PlanetMenu />
		<div class="pt-10">
			{#if loading}
				<div class="flex justify-center">
					<Spinner color="purple" />
				</div>
			{:else if proposals.length == 0}
				<div class="flex justify-center">No Data</div>
			{:else}
				<div class="flex flex-col gap-6">
					{#each proposals as proposal}
						<button class="flex flex-row" on:click={() => selectProposal(proposal)}>
							<div class="w-8 flex-none place-self-center">
								{#if selectedProposal && selectedProposal.proposal_id == proposal?.proposal_id}
									<LabelSolid class="text-stone-300 h-5 w-5 " />
								{/if}
							</div>
							<div
								class={`flex-grow rounded-2xl border border-solid p-5 shadow-md  ${
									proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.PENDING_APPROVAL.value
										? 'border-gray-700 shadow-gray-700 '
										: proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.HAS_ENOUGH_APP_VOTES.value
											? 'border-green-700 shadow-green-700'
											: proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.IN_PROGRESS.value
												? 'border-blue-700 shadow-blue-700'
												: proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.PENDING_FINALIZE.value
													? 'border-yellow-700 shadow-yellow-700'
													: proposal.state ==
														  AW_WORKER_PROPOSALS.PROP_STATE.HAS_ENOUGH_FIN_VOTES.value
														? 'border-teal-700 shadow-teal-700'
														: proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.EXPIRED.value
															? 'border-red-700 shadow-red-700'
															: proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.DISPUTED.value
																? 'border-purple-700 shadow-purple-700'
																: ''
								}`}
							>
								<div class="flex flex-row flex-wrap">
									<div class="flex flex-none basis-2/12 flex-col text-start">
										<div>
											#: <span class="text-white underline">{proposal.proposal_id}</span>
										</div>
										<div
											class={`${
												proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.PENDING_APPROVAL.value
													? 'text-gray-500 '
													: proposal.state ==
														  AW_WORKER_PROPOSALS.PROP_STATE.HAS_ENOUGH_APP_VOTES.value
														? 'text-green-500'
														: proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.IN_PROGRESS.value
															? 'text-blue-500'
															: proposal.state ==
																  AW_WORKER_PROPOSALS.PROP_STATE.PENDING_FINALIZE.value
																? 'text-yellow-500'
																: proposal.state ==
																	  AW_WORKER_PROPOSALS.PROP_STATE.HAS_ENOUGH_FIN_VOTES.value
																	? 'text-teal-500'
																	: proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.EXPIRED.value
																		? 'text-red-500'
																		: proposal.state ==
																			  AW_WORKER_PROPOSALS.PROP_STATE.DISPUTED.value
																			? 'text-purple-500'
																			: ''
											}`}
										>
											{getStateName(proposal.state)}
										</div>
										<div>{getApprovalState(proposal)}</div>
									</div>
									<div class="mx-3 flex-none basis-3/12 flex-col text-start">
										<div>Proposer: <span class="text-white">{proposal.proposer}</span></div>
										<div>
											Proposer Pay: <span class="text-white">{proposal.proposal_pay.quantity}</span>
										</div>
										<div>
											Document: <a
												class="text-blue-400 underline"
												target="_blank"
												href={`${PUBLIC_PINATA_GATEWAY}/ipfs/${proposal.content_hash}/?pinataGatewayToken=${PUBLIC_PINATA_GATEWAY_KEY}`}
												>Get File</a
											>
										</div>
									</div>
									<div class="mx-3 flex flex-1 flex-col text-start">
										<div>
											Arbiter: <span class="text-white">{proposal.arbiter}</span>
											<span
												class={`${proposal.arbiter_agreed ? 'text-green-400' : 'text-yellow-400'}`}
												>({proposal.arbiter_agreed ? 'Agreed' : 'Waiting'})</span
											>
										</div>
										<div>
											Arbiter Pay: <span class="text-white">{proposal.arbiter_pay.quantity}</span>
										</div>
									</div>
									<div class="flex flex-none basis-3/12 flex-col text-end">
										<div>Expired At</div>
										<div class="text-white">
											{moment(`${proposal.expiry}`).format('YYYY-MM-DD HH:mm:ss')}
										</div>
										<div>
											Duration: <span class="text-white"
												>{secondsToHHMM(proposal.job_duration)}</span
											>
										</div>
									</div>
								</div>
								<!-- <div class="flex justify-between">
									<div>
										Content Hash: <a
											class="text-blue-400 underline"
											target="_blank"
											href={`${PUBLIC_PINATA_GATEWAY}/ipfs/${proposal.content_hash}/?pinataGatewayToken=${PUBLIC_PINATA_GATEWAY_KEY}`}
											>{proposal.content_hash}</a
										>
									</div>
									<div>
										Duration: <span class="text-white">{secondsToHHMM(proposal.job_duration)}</span>
									</div>
								</div> -->
								<div class="mx-auto mt-5 w-2/3 border-t-2 border-dotted border-gray-500"></div>
								<div class="mt-2 text-start">
									<div>
										Title: <span class="text-white">
											{#each proposal.title.split('\n') as line}
												{line}
												<br />
											{/each}</span
										>
									</div>
									<div class="mt-1">
										Summary: <span class="text-white">
											{#each proposal.summary.split('\n') as line}
												{line}
												<br />
											{/each}
										</span>
									</div>
								</div>
								{#if proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.EXPIRED.value || proposal.state == AW_WORKER_PROPOSALS.PROP_STATE.DISPUTED.value}
									<div></div>
								{:else}
									<div class="mx-auto mt-5 w-2/3 border-t-2 border-dotted border-gray-500"></div>
									<div class="mt-2 text-start">
										<div>
											Approved by: <span class="text-white">{getApprovedBy(proposal)}</span>
										</div>
										<div class="mt-1">
											Denied by: <span class="text-white">{getDeniedBy(proposal)}</span>
										</div>
									</div>
								{/if}
							</div>
							<div class="w-8 flex-none"></div>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
<div class="left-side">
	<!-- {#if $session}{/if} -->
</div>
<div class="right-side">
	<WorkerProposalAction
		{selectedProposal}
		on:new_proposal={handleNewProposal}
		on:delegatevote={handleDelegate}
		on:mockdata={handleMockData}
	/>
</div>

<CreateWorkerProposalModal
	isOpen={isModalOpen}
	onClose={closeModal}
	onCreateProposal={handleCreateProposalAction}
/>

<WPDelegateVoteModal
	isOpen={isDelegateModalOpen}
	{isDelegate}
	onClose={closeDelegateModal}
	onDelegate={handleDelegateAction}
/>

<!-- TODO: load more function for proposal list -->

<style>
</style>
