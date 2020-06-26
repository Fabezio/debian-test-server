<script>
	export let mode
  // import Glass from '../UI/Glass.svelte'
</script>

<nav class="glass">
  <ul class="nav justify-content-center sticky-top mb-5 bg-light" id="top">
		<li class="nav-item"><a class="nav-link active" href="#about">A propos</a></li>
		<li class="nav-item"><a class="nav-link" href="#changes">Changements</a></li>
		<li class="nav-item"><a class="nav-link" href="#docroot">Documentation</a></li>
		<li class="nav-item"><a class="nav-link" href="#bugs">Problèmes</a></li>
	</ul>

</nav>

<style>
	nav {
			/* background: rgba(0,0,0,0.15); */
			margin-bottom: 3rem;
			padding: 0.5rem;
	}

	nav ul {
			display: flex;
			justify-content: space-evenly;
	}

	nav li {
			list-style: none;;
	}

	nav a {
			color: whitesmoke;
			text-decoration: none;
	}
	.glass{
			background: rgba(0,0,0,0.15);
	}
</style>