<script lang="ts">
	import { page } from '$app/stores';
	import { NavHamburger, NavLi, NavUl, Navbar } from 'flowbite-svelte';
	$: activeUrl = $page.url.pathname;
</script>

<div>
	<Navbar let:NavContainer color="none">
		<NavContainer class="max-h-12 rounded-xl border border-indigo-500">
			<NavHamburger />
			<NavUl {activeUrl} nonActiveClass="text-default">
				<NavLi href="/">Home</NavLi>
				<NavLi href="/voting">Voting</NavLi>
				<NavLi href="/voting">Voting</NavLi>
				<NavLi href="/voting">Voting</NavLi>
				<NavLi href="/voting">Voting</NavLi>
				<NavLi href="/voting">Voting</NavLi>
			</NavUl>
		</NavContainer>
	</Navbar>
</div>

<style>
</style>
