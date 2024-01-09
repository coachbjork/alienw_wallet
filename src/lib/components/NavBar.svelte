<script lang="ts">
	import { page } from '$app/stores';
	import { NavLi, NavUl, Navbar } from 'flowbite-svelte';
	$: activeUrl = $page.url.pathname;
</script>

<div>
	<Navbar let:NavContainer color="none">
		<NavContainer class="rounded-3xl border border-indigo-500">
			<NavUl {activeUrl}>
				<NavLi href="/" nonActiveClass="text-default">Home</NavLi>
				<NavLi href="/voting" nonActiveClass="text-default">Voting</NavLi>
				<NavLi href="/voting" nonActiveClass="text-default">Voting</NavLi>
				<NavLi href="/voting" nonActiveClass="text-default">Voting</NavLi>
				<NavLi href="/voting" nonActiveClass="text-default">Voting</NavLi>
				<NavLi href="/voting" nonActiveClass="text-default">Voting</NavLi>
			</NavUl>
		</NavContainer>
	</Navbar>
</div>

<style>
</style>
