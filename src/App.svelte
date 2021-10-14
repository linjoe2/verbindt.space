<script>
	import {TimePicker,FormField, Button} from 'attractions';
	export let name;
	const prijzen = [
    { value: '20', label: '10 Minuten' },
    { value: '25', label: '15 Minuten' },
	{ value: '50', label: '30 Minuten' },
  ];
	let tijd,naam,email,telefoon,minuten, modalOpen
	function verstuur(){
		console.log(tijd)
		console.log(naam)
		console.log(email)
		console.log(telefoon)

		let body = {
			"minuten": minuten;
			"tijd": tijd,
			"naam": naam,
			"email": email,
			"telefoon": telefoon
		}

		fetch('/versturen', {
			method: 'POST',
			headers: {
			'Content-Type': 'application/json'
			},
			body
		})
		.then(() => {
			modalOpen = true;

		})
		.catch(()=>{
			alert("je boeking is jammer genoeg niet gelukt, probeer het opnieuw")
		})
	}
</script>

<main>
	<div class="centerdiv">
		<h1>Bestel hier uw massage!</h1>
		<label>Aantal minuten</label>
		<RadioGroup {prijzen} bind:value="{minuten}" name="minuten" />
		<label>Om welke tijd wil je gemasseerd worden?</label>
		<TimePicker bind:value="{tijd}" right />
		<FormField bind:value="{naam}"
			name="Voornaam"
			help="Met welke naam wordt je graag aangesproken?"
			required
		>
		<FormField bind:value="{email}"
			name="Email adress"
			help="waar kan de bevestigingsmail heen?"
			required
		>
		<FormField bind:value="{phone}"
			name="Telefoonnummer"
			help="Als ik je niet kan vinden bel ik"
			required
		>
		<Button on:click={verstuur} filled>Boeken</Button>
	</div>
	<Modal bind:open={modalOpen} let:closeCallback>
		<Dialog title="Booking geslaagd" {closeCallback}>
		  Je staat ingeplaned om: {tijd}
		  Kosten: {price}
		</Dialog>
		<Button on:click={betaal} filled>Afrekenen</Button>
	  </Modal>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>