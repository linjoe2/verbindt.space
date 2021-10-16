<script>
  import {
    TimePicker,
    FormField,
    Button,
    RadioGroup,
    Modal,
    Dialog,
	  TextField,
    Divider,
    Table
  } from "attractions";
	import { onMount } from 'svelte';
  var emailVal = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var telefoonVal = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  import {verstuur} from "./api";
  export let name;
  let tijd = new Date(Date.now()), naam, body, email = "", telefoon, minuten = 15, modalOpen, prijs;


  let rows = [
  ];
  const columns = [
    { text: 'naam', value: 'naam' },
    { text: 'tijd', value: 'tijd' },
    { text: 'minuten', value: 'minuten', align: 'end' },
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
    if(checkData(body)){
      verstuur(body)
    }
  }

  function checkData(body){
    if(!!!body.minuten){
      alert("vul minuten in")
      return false
    }
    if(!!!body.naam){
      alert("vul naam in")
      return false
    }
    if(!emailVal.exec(body.email)){
      alert("vul email in")
      return false
    }
    if(!telefoonVal.exec(body.telefoon)){

        alert("vul telefoonnummer in")
        return false

    }
    return true
  }

  const items = [
    { value: 10, label: '10 Minuten', price: 20 },
    { value: 15, label: '15 Minuten', price: 25},
    { value: 30, label: "30 Minuten", price: 50 }
  ];
</script>

<main>
  <div class="centerdiv">
    <Divider text="Massage rooster" />
  <Table id="table" headers="{columns}" items="{rows}"/>
  <Divider text="Bestel hier uw massage!" />
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
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }




  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
