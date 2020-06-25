import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		name: "Page d'accueil test serveur (localhost)"
	}
});

export default app;