<script>
	// import Glass from './UI/Glass.svelte'
	import { users } from './DebianServer/users-store'
	import Navbar from './Layouts/Navbar.svelte'
	import Footer from './Layouts/Footer.svelte'
	import Card from './UI/Card.svelte'
	import Modal from './UI/Modal.svelte'
	export let pagename;
	let user = 'fabezio'
	let root = true
	let isOK = true
	let isOn = true
	let alerts

	let username = ''
	let job = ''
	// let privileges = ''
	let hobbies = ''
	let value = ''
	let quotation =''
	$: if (value.length) quotation = value
	// let username = ''

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
	let upSigned = true
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
	// $: console.log(images.length, rndImg)
	// $: {if(root) adminUser 
	// 		else user }
	$: {if(!isOK) {
				isOn = false 
				alerts = '!'
			}else{
				isOn = true
				alerts = null
			}}

	$: console.log($users)
	$: if(!upSigned) console.log('You have to sign up to get minimum privileges.')

</script>

<svelte:head>{pagename}</svelte:head>

<main
	style="background-image: url('./img/{root? sudoImg[rndRootImg] : images[rndImg]}'" 
	>
	{#if !upSigned}
			<!-- content here -->
			<Modal>
				<div class="userdata" slot='title'>
					<p >
					Fill the form below then click the Sign up button
					</p>
				</div>
				<!-- <h4 slot="title">Sign up</h4> -->
				<div slot='content'>
					<form action="">
						
						<input bind:value={username} cols="30" placeholder="name:">
						{username} <br>
						<input bind:value={job} placeholder="job:">
						{job} <br>
						<input bind:value={hobbies} placeholder="hobbies:">
						{hobbies} <br>
						<textarea bind:value name="" id="" cols="30" rows="2" placeholder="quotation here"></textarea>
						{quotation}
					</form>
				</div>

				<button slot='footer' on:click={() => upSigned = true}>Sign up</button>
			</Modal>
	{:else}
		 <!-- else content here -->
		<Navbar />
		<header>  
			<h1 class="">{pagename}</h1>
		</header>
		<section >
			<div class="group">
				<Card>
					<p >user:  <span class="on">{user}{root ? ' (admin)' : ''}</span></p>
					<p on:click={() => root = !root}>privileges:  <span class={ root ? "on" : "off"}>{root ? 'root' : 'normal'}</span></p>
					{#if alerts }				 
						<div class="alert" on:click={handleAlert}>{alerts}</div>
					{/if}
					<p on:click={() => isOK = !isOK}>test: <span class={ isOK ? "on" : "off"}>{isOK ? 'OK' : 'failed'}</span></p>
					<p on:click={() => isOn = !isOn}>status: <span class={ isOn ? "on" : "off"}>{isOn? "on" : "off"}</span></p>
					
				</Card>
			
				{#if root}
					<Card>
						<p>add user</p>
						<p on:click={() => dispModal = true}>see user info</p>
						<p>update user</p>
						<p>delete user</p>
					</Card>
				{/if}
			</div>

			{#if dispModal}
				<Modal {dispModal}>
					<div slot="title" class="userdata">
						<h4>User Info</h4>
					</div>
					<div slot="content" class="userdata">
						{#each $users as user}
							<!-- content here -->
								<img src="./logos/{user.avatar}" alt="" />
								<p>Name: {user.name}</p>	
								<p>Group: {user.group}</p>	
								<p>Job: {user.job}</p>	
								<p>Hobbies:
								{#each user.hobbies as hobby}
									<br>- {hobby}
								{/each}
								</p>
								<p>Favorite sentence: 
								<q>{user.adage}</q>
								</p>
							
						{/each}
					</div>
					<div slot="footer">
						<button on:click={() => dispModal = false}>close</button>
						<!-- <button on:click={console.log('del')} >delete</button> -->
					</div>
				</Modal>
			{/if}	
		</section>

		<Footer />	
	{/if}
</main>

<style>	
	main {
		padding: 0;
		margin: 0;
		height: 100vh;
		width: 100%;
		background-size: cover;
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
		text-align: justify;
		color: lightgray;
	}
	
	section p {
		font-weight: 300;
		margin: 0.25rem 0.5rem;
		padding: 0.2rem 0.5rem;

	}
	section p:hover :not(#userdata *) {
		cursor: pointer;
		color: #ddd;
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
	.userdata {
		display: block;
	}
	.userdata  * {
		color: black;
		text-shadow: none;

	}

	img {
		width: 200px;
		float:left;
	}
	button {
		position: absolute;
		right: 2rem;
	}
</style>