<script>
  import {
    TimePicker,
    FormField,
    Button,
    RadioGroup,
    Modal,
    Dialog,
	TextField
  } from "attractions";
  import SvelteTable from "svelte-table";
	import { onMount } from 'svelte';

  import {verstuur} from "./api";
  export let name;
  let tijd, naam, body, email = "ik@lindseyschaap.nl", telefoon, minuten, modalOpen, prijs;


  let rows = [
  ];
  const columns = [
    {
    key: "tijd",
    title: "Tijd",
    value: v => {
      let time = new Date(v.tijd)
      return time.getHours()+ ":"+ time.getMinutes();
    },
    sortable: true,
  },
  {
    key: "Naam",
    title: "name",
    value: v => v.naam,
    sortable: true,
  },
  {
    key: "minuten",
    title: "Minuten",
    value: v => v.minuten,
    sortable: true,
  },
  ];

  onMount(async () => {
		const res = await fetch("/boekingen");
		rows = await res.json();
    console.log(rows)
	});


  function verstuurSender(){
    items.forEach((item)=>{
      if (item.value == minuten){
        prijs = item.price
      }
    })

    body = {
      "minuten": minuten,
      "tijd": tijd,
      "naam": naam,
      "email": email,
      "telefoon": telefoon,
      "prijs": prijs
    };

    verstuur(body)
  }

  function betaal() {}

  const items = [
    { value: 10, label: '10 Minuten', price: 20 },
    { value: 15, label: '15 Minuten', price: 25},
    { value: 30, label: "30 Minuten", price: 50 }
  ];
</script>

<main>
  <div class="centerdiv">
    <h2>Rooster</h2>
  <SvelteTable columns="{columns}" rows="{rows}"></SvelteTable>
    <h1>Bestel hier uw massage!</h1>
    <FormField
  name="Aantal minuten"
  required
>
    <RadioGroup items={items} bind:value={minuten} name="numbers" />
      </FormField>
      <FormField
      name="Tijd"
      help="Om welke tijd wil je gemasseerd worden?"
      required
    >
    <TimePicker bind:value={tijd} right />
  </FormField>

    <FormField
      name="Voornaam"
      help="Met welke naam wordt je graag aangesproken?"
      required
    >
      <TextField bind:value={naam} />
    </FormField>
    <FormField
      name="Email adress"
      help="waar kan de bevestigingsmail heen?"
      type="email"
      required
    >
      <TextField bind:value={email} />
    </FormField>
    <FormField
      name="Telefoonnummer"
      help="Als ik je niet kan vinden bel ik"
      type="phone"
      required
    >
      <TextField bind:value={telefoon} />
    </FormField>
    <Button on:click={verstuurSender} filled>Boeken</Button>
  </div>
  <Modal bind:open={modalOpen} let:closeCallback>
    <Dialog title="Booking geslaagd" {closeCallback}>
      Je staat ingeplaned om: {tijd} <br>
      Kosten: {prijs}
      <Button on:click={betaal} filled>Afrekenen</Button>
    </Dialog>
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
