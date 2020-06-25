<script>
	import Card from './UI/Card.svelte'
	export let name;
</script>

<main>
	<nav class="glass">
		<ul class="nav justify-content-center sticky-top mb-5 bg-light" id="top">
			<li class="nav-item"><a class="nav-link active" href="#about">A propos</a></li>
			<li class="nav-item"><a class="nav-link" href="#changes">Changements</a></li>
			<li class="nav-item"><a class="nav-link" href="#docroot">Documentation</a></li>
			<li class="nav-item"><a class="nav-link" href="#bugs">Problèmes</a></li>
		</ul>
	</nav>
	<header>  
		<h1 class="float-right">{name}</h1>
	</header>
	<section >
		<Card >
			<div class="glass border">
				<p>user:  <span class="on">admin</span></p>
				<p>privileges:  <span class="on">root</span></p>
				<p>test: <span class="on">ok</span></p>
				<p>status: <span class="off">off</span></p>
			</div>
		</Card>
		
	</section>
	<footer class="glass"><span>debian server</span><span>&copy;</span><span>2020</span></footer>
</main>

<style>
	/* * {
    margin: 0px 0px 0px 0px;
    padding: 0px 0px 0px 0px;
	} */
	main {
		padding: 0;
		margin: 0;
		height: 100vh;
		width: 100%;
		background-image: url("./img/debian10_3.jpg");
		background-size: cover;
		/* backgro */
		font-family: Verdana, sans-serif;
		font-size: 1rem;
		text-align: center;
		color: whitesmoke;
		text-shadow: 1px 1px rgba(0,0,0,0.65)
	}

	header {
		margin: 4rem;
	}

	p {
		/* color: white; */
		text-align: justify;
	}

	nav {
			/* background: rgba(0,0,0,0.15); */
			margin-bottom: 3rem;
			padding: 1rem;
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


	footer {
			display: block;
			width: 100%;
			text-align: center;
			padding: 1rem;
			position: fixed;
			bottom: 0;
			margin: auto;
	}
	footer span {
			margin: 0 0.33rem;
	}

	.glass{
			background: rgba(0,0,0,0.15);
	} 
	.glass p {
			font-weight: 100;
			margin: 0.25rem 0.5rem;
			padding: 0.2rem 0.5rem;

	}
	.glass p:hover {
		cursor: pointer;
		/* background: rgba(0,0,0,0.05); */
		color: #ddd;
		/* border-top: 1px inset rgba(0,0,0,0.1); */
		/* border-bottom: 1px outset rgba(0,0,0,0.1); */
	}
	.glass p:hover span {
			color: #0ee;
	}

	

	.border {
			border-radius: 10px;
			border: 2px outset rgba(0,0,0,0.05);
	} 

	.on {
			color: #0dd;
	}
	.off {
			color: pink;
	}

</style>