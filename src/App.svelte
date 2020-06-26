<script>
	import Glass from './UI/Glass.svelte'
	import Navbar from './Layouts/Navbar.svelte'
	import Footer from './Layouts/Footer.svelte'
	import Card from './UI/Card.svelte'
	import Modal from './UI/Modal.svelte'
	export let name;
	let user = 'fabezio'
	let root = true
	let isOK = true
	let isOn = true
	let alerts
	let images = [
		'1920x1080.png',
		'Abstract Shapes 2.jpg',
		'Abstract Shapes.jpg',
		'Chroma 1.jpg',
		'Chroma 2.jpg',
		'Flower 1.jpg',
		'Flower 2.jpg',
		'Flower 3.jpg',
		'Flower 4.jpg',
		'Mojave Day.jpg',
		'Mojave Night.jpg'

		// 'debian10_grey.jpg',
	]
	let sudoImg = [
		'debian10.jpg',
		// 'debian10.jpg',
		'debian10_2.jpg',
		'debian10_3.jpg',
		'bash_oblique.jpg'

	]
	let rndImg = Math.floor(Math.random() * images.length)
	let rndRootImg = Math.floor(Math.random() * sudoImg.length)
	let dispModal = false

	function checkStatus() {
		// if (!root) {
		// 	user = normal
		// }
	}

	function handleAlert() {
		alerts = ""
		isOK = true 

	}
	$: console.log(images.length, rndImg)
	// $: {if(root) adminUser 
	// 		else user }
	$: {if(!isOK) {
				isOn = false 
				alerts = '!'
			}else{
				isOn = true
				alerts = null
				}}


</script>

<svelte:head>{name}</svelte:head>

<main
 style="background-image: url('./build/img/{root? sudoImg[rndRootImg] : images[rndImg]}'" 
 >
	<Navbar mode="glass border" />
	<!-- <Glass>
	</Glass> -->
	<header>  
		<h1 class="">{name}</h1>
	</header>
	<section >
		<div class="group">
		<Card mode="glass">
			<p >user:  <span class="on">{user}{root ? ' (admin)' : ''}</span></p>
			<p on:click={() => root = !root}>privileges:  <span class={ root ? "on" : "off"}>{root ? 'root' : 'normal'}</span></p>
			{#if alerts }
				 <!-- content here -->
				<div class="alert" on:click={handleAlert}>{alerts}</div>
			{/if}
			<p on:click={() => isOK = !isOK}>test: <span class={ isOK ? "on" : "off"}>{isOK ? 'OK' : 'failed'}</span></p>
			<p on:click={() => isOn = !isOn}>status: <span class={ isOn ? "on" : "off"}>{isOn? "on" : "off"}</span></p>
			<!-- <div class="glass border">
			</div> -->
		</Card>
	
		{#if root}
			<Card mode="glass border">
				<p>add user</p>
				<p on:click={() => dispModal = true}>see user info</p>
				<p>update user</p>
				<p>delete user</p>
				
			</Card>
			 <!-- content here -->
		{/if}
	
		</div>
		{#if dispModal}
			<Modal {dispModal}>
				<button  on:click={() => dispModal = false}>close</button>
			</Modal>
			 <!-- content here -->
		{/if}
	
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
		/* background-image: url("./build/img/{images[rndImg]}"); */
		background-size: cover;
		/* backgro */
		font-family: Verdana, sans-serif;
		font-size: 1rem;
		text-align: center;
		color: whitesmoke;
		text-shadow: 1px 1px 1px rgba(0,0,0,0.95)
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
	.group {
		display: flex;
	}
	.alert {
		font-size: 0.75rem;
		background: rgba(255,0,0, 0.75);
		border-radius: 50%;
		width: 1rem;
		float:left;
		cursor: pointer;
	}

	.glass{
			background: rgba(0,0,0,0.15);
	} 
  .border {
			border-radius: 10px;
			border: 2px outset rgba(0,0,0,0.05);
	} 

</style>