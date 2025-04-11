// / Handle fund wallet/payment logic
const fundBtn = document.getElementById("fundBtn");
fundBtn.addEventListener("click", async () => {
  // prompt user to input fundAmount
  var { value: fundAmount } = await Swal.fire({
    title: "Fund Wallet",
    input: "number",
    inputLabel: "Enter to fund (in Naira)",
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value || value == 0 || value == NaN) {
        return "You need to input a valid amount!";
      }
    },
  });
  if (fundAmount) {
    Swal.fire({
      position: "center",
      icon: "info",
      title: "Processing...",
      text: `Please wait while we initialize payment...`,
      showConfirmButton: false,
    });
  }
  fundAmount = parseFloat(fundAmount);

  // make request to initialize payment
  const fetchOptions = {
    method: "post",
    body: JSON.stringify({ email: userData.email, fundAmount }),
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  };

  fetch("http://localhost:5000/initiate-payment", fetchOptions)
    .then((res) => {
      res.json().then((data) => {
        if (res.ok) {
          Swal.fire({
            position: "center",
            icon: "success",
            text: "Data ok",
            showConfirmButton: false,
          });

          // trigger Paystack PopUp
          const popup = new PaystackPop();
          popup.resumeTransaction(
            data.message.access_code
          ).parameters.onSuccess = (transaction) => {
            console.log("first");
          };

          // verify transaction
          // verifyTransaction(data.message.reference, fundAmount);
        } else {
          Swal.fire({
            position: "center",
            icon: "error",
            title: "We had an issue!",
            text: `${data.message}`,
            showConfirmButton: true,
          });
          console.log(data.message);
        }
      });
    })
    .catch((err) => {
      alert("An unexpected error occurred");
      console.log(err);
    });
});

async function verifyTransaction(reference, fundAmount) {
  const fetchOptions = {
    method: "post",
    body: JSON.stringify({ reference, fundAmount }),
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  };

  fetch("http://localhost:5000/verify-payment", fetchOptions)
    .then((res) => {
      if (res.ok) {
        Swal.fire({
          position: "center",
          icon: "success",
          tile: "Payment successful!",
          text: `You will be funded with ₦${fundAmount}`,
          // showConfirmButton: false,
        });
      } else {
        Swal.fire({
          position: "center",
          icon: "error",
          text: "Payment failed!",
        });
      }
    })
    .catch((err) => {
      alert("An unexpected error occurred");
      console.log(err);
    });
}
