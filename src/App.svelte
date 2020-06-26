<script>
	import Glass from './UI/Glass.svelte'
	import Navbar from './Layouts/Navbar.svelte'
	import Footer from './Layouts/Footer.svelte'
	import Card from './UI/Card.svelte'
	export let name;
	let user = 'admin'
	let root = true
	// let test = 'ok'
	let isOK = true
	let isOn = true
	let images = [
		'debian10.jpg',
		'debian10_2.jpg',
		'debian10_3.jpg',
		'debian10_grey.jpg',
	]
	let rndImg = Math.floor(Math.random() * images.length)
	$: console.log(images.length)
	$: if(!root) user = 'normal'
	$: {if(!isOK) 
				isOn = false 
			else if (isOn == true) 
				isOK = true}


</script>

<svelte:head>{name}</svelte:head>

<main>
	<Glass>
		<Navbar />
	</Glass>
	<header>  
		<h1 class="float-right">{name}</h1>
	</header>
	<section >
		<Card >
			<p >user:  <span class="on">{user}</span></p>
			<p on:click={() => root = !root}>privileges:  <span class={ root ? "on" : "off"}>{root ? 'root' : 'normal'}</span></p>
			<p on:click={() => isOK = !isOK}>test: <span class={ isOK ? "on" : "off"}>{isOK ? 'OK' : 'Failed'}</span></p>
			<p on:click={() => isOn = !isOn}>status: <span class={ isOn ? "on" : "off"}>{isOn? "on" : "off"}</span></p>
			<!-- <div class="glass border">
			</div> -->
		</Card>
		<div class="">
		{#if root}
			<Card >
				<h3>
				dashboard
				</h3>
			</Card>
			 <!-- content here -->
		{/if}
		</div>
	
	</section>
	<Glass>
		<Footer />
	</Glass>	
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
		text-shadow: .5px .5px rgba(0,0,0,0.65)
	}

	header {
		margin: 4rem;
		clear: both;
	}

	p {
		/* color: white; */
		text-align: justify;
	}
	
	section p {
			font-weight: 100;
			margin: 0.25rem 0.5rem;
			padding: 0.2rem 0.5rem;

	}
	section p:hover {
		cursor: pointer;
		/* background: rgba(0,0,0,0.05); */
		color: #ddd;
		/* border-top: 1px inset rgba(0,0,0,0.1); */
		/* border-bottom: 1px outset rgba(0,0,0,0.1); */
	}
	section p:hover span {
			color: #0ee;
	}

	.on {
			color: #0dd;
	}
	.off {
			color: pink;
	}
	.float-right {
		float: right;
	}

</style>