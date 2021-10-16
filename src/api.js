import axios from "axios";

export const verstuur = async (data) => {
    console.log(data)
    fetch("/versturen", {
     
    // Adding method type
    method: "POST",
     
    // Adding body or contents to send
    body: JSON.stringify(data),
     
    // Adding headers to the request
    headers: {
        "Content-type": "application/json; charset=UTF-8"
    }
})
.then(r =>  r.json().then(data => {
    console.log(data)
    window.location.href = data.url
}))

        .catch((err) => {
          console.log(err)
          alert("je boeking is jammer genoeg niet gelukt, probeer het opnieuw");
        });
    }