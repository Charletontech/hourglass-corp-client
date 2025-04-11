function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("active");
}

var userData = sessionStorage.getItem("hourglassUserData");
window.addEventListener("load", () => {
  const overlay = document.getElementById("overlay");
  if (!userData) {
    overlay.classList.remove("hidden");
  }
});

// inserting UI data
userData = JSON.parse(userData);
document.querySelector(".card p strong").innerHTML = userData.name;
document.querySelector(".card p span").innerHTML = userData.phone;

// update balance logic
getWalletBalance();
function getWalletBalance() {
  fetch(`http://localhost:5000/get-balance?phone=${userData.phone}`)
    .then((res) => {
      res.json().then((data) => {
        if (res.ok) {
          document.querySelectorAll(".card p span")[1].innerText =
            data.message.wallet || 0;

          document.querySelector(".wallet-balance strong span").innerHTML =
            data.message.wallet || 0;
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

// Handle fund wallet/payment logic
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

  // get payment access
  const access = await getAccess();
  if (access.success !== true) {
    return;
  }

  // trigger payment
  const popup = new PaystackPop();
  popup.checkout({
    key: access.access,
    email: userData.email,
    amount: fundAmount,
    onSuccess: (transaction) => {
      // console.log(transaction);
      verifyTransaction(transaction.reference, fundAmount, userData.phone);
    },
    onLoad: (response) => {
      // console.log("onLoad: ", response);
    },
    onCancel: () => {
      Swal.fire({
        position: "center",
        icon: "info",
        text: "Payment cancelled!",
      });
    },
    onError: (error) => {
      Swal.fire({
        position: "center",
        icon: "error",
        text: "Payment failed!",
      });
      console.log("Error: ", error.message);
    },
  });
});

async function verifyTransaction(reference, fundAmount, phone) {
  const fetchOptions = {
    method: "post",
    body: JSON.stringify({ reference, fundAmount, phone }),
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

async function getAccess() {
  return new Promise((resolve, reject) => {
    fetch("http://localhost:5000/get-access")
      .then((res) => {
        res.json().then((data) => {
          if (res.ok) {
            resolve({ success: true, access: data.message });
          } else {
            Swal.fire({
              position: "center",
              icon: "error",
              title: "We had an issue!",
              text: `An error occured while accessing payment permission`,
              showConfirmButton: true,
            });
          }
        });
      })
      .catch((err) => {
        alert("An unexpected error occurred");
        console.log(err);
        reject(err);
      });
  });
}

// logic for services
const ninValidationBtn = document.getElementById("ninValidationBtn");
ninValidationBtn.addEventListener("click", async (e) => {
  const { value: ninValidationType } = await Swal.fire({
    title: "Select Type",
    input: "select",
    inputOptions: {
      jamb: "Jamb",
      immigration: "Immigration",
      noRecord: "No Record",
      vnin: "VNIN",
      bank: "Bank Verification",
    },

    inputPlaceholder: "Select NIN Validation type",
    showCancelButton: true,
    confirmButtonText: "Next",
    confirmButtonColor: "#044c6c",
    cancelButtonColor: "#00c4cc",
    inputValidator: (value) => {
      return new Promise((resolve) => {
        if (value !== "") {
          resolve();
        } else {
          resolve("You need to choose a validation type");
        }
      });
    },
  });
  if (ninValidationType) {
    const { value: nin } = await Swal.fire({
      title: "Enter your NIN",
      input: "text",
      inputLabel: "e.g 22143892XXX",
      showCancelButton: true,
      confirmButtonText: "Validate",
      confirmButtonColor: "#044c6c",
      cancelButtonColor: "#00c4cc",
      inputValidator: (value) => {
        if (!value) {
          return "NIN can not be empty";
        }
      },
    });
    if (nin) {
      submitNinValidation(ninValidationType, nin);
    }
  }
});

function submitNinValidation(ninValidationType, nin) {
  // alert user to wait while processing
  Swal.fire({
    title: "Processing!",
    html: "Please wait while we process your request...",
    timerProgressBar: true,
    didOpen: () => {
      Swal.showLoading();
    },
  });
  const fetchOptions = {
    method: "post",
    body: JSON.stringify({
      ninValidationType,
      nin,
      service: "NIN Validation",
      phone: userData.phone,
      user: userData.name,
    }),
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  };
  fetch("http://localhost:5000/nin-validation", fetchOptions)
    .then((res) => {
      res.json().then((data) => {
        if (res.ok) {
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Request sent",
            text: `${data.message}`,
            showConfirmButton: true,
            confirmButtonColor: "#044c6c",
          });
        } else {
          Swal.fire({
            position: "center",
            icon: "error",
            title: "We had an issue!",
            text: `${data.message}`,
            footer: "Please contact Admin",
            showConfirmButton: true,
            confirmButtonColor: "#044c6c",
          });
        }
      });
    })
    .catch((err) => {
      alert("An unexpected error occurred");
      console.log(err);
    });
}

// handle suspended NIN service
async function handleSuspendedNinBtn() {
  const { value: nin } = await Swal.fire({
    title: "Enter your NIN",
    input: "text",
    inputLabel: "e.g 22143892XXX",
    showCancelButton: true,
    confirmButtonText: "Validate",
    confirmButtonColor: "#044c6c",
    cancelButtonColor: "#00c4cc",
    inputValidator: (value) => {
      if (!value) {
        return "NIN can not be empty";
      }
    },
  });
  if (nin) {
    submitSuspendedNin(nin);
  }
}

function submitSuspendedNin(nin) {
  // alert user to wait while processing
  Swal.fire({
    title: "Processing!",
    html: "Please wait while we process your request...",
    timerProgressBar: true,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  const fetchOptions = {
    method: "post",
    body: JSON.stringify({
      nin,
      service: "Suspended NIN",
      phone: userData.phone,
      name: userData.name,
    }),
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  };
  fetch("http://localhost:5000/suspended-nin", fetchOptions)
    .then((res) => {
      res.json().then((data) => {
        if (res.ok) {
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Request sent",
            text: `${data.message}`,
            showConfirmButton: true,
            confirmButtonColor: "#044c6c",
          });
        } else {
          Swal.fire({
            position: "center",
            icon: "error",
            title: "We had an issue!",
            text: `${data.message}`,
            footer: "Please contact Admin",
            showConfirmButton: true,
            confirmButtonColor: "#044c6c",
          });
        }
      });
    })
    .catch((err) => {
      alert("An unexpected error occurred");
      console.log(err);
      reject(err);
    });
}

// handle DataModification button
async function handleDataModificationBtn() {
  const { value: dataModificationType } = await Swal.fire({
    title: "Select Data To Change",
    input: "select",
    inputOptions: {
      name: "Name",
      phoneNumber: "Phone Number",
      DateOfBirth: "Date Of Birth",
    },
    inputPlaceholder: "Which data do you want to change",
    showCancelButton: true,
    confirmButtonText: "Next",
    confirmButtonColor: "#044c6c",
    cancelButtonColor: "#00c4cc",
    inputValidator: (value) => {
      return new Promise((resolve) => {
        if (value !== "") {
          resolve();
        } else {
          resolve("You need to indicate which data to modify");
        }
      });
    },
  });

  if (dataModificationType) {
    const { value: formValues } = await Swal.fire({
      title: "Bio-data Form",
      html:
        `<input id="swal-input1" class="swal2-input" placeholder="First Name">` +
        `<input id="swal-input2" class="swal2-input" placeholder="Middle Name">` +
        `<input id="swal-input3" class="swal2-input" placeholder="Last Name">` +
        `<input id="swal-input4" class="swal2-input" type="date" placeholder="Date of Birth">` +
        `<input id="swal-input5" class="swal2-input" placeholder="Phone Number">` +
        `<input id="swal-input6" class="swal2-input" placeholder="Home Address">` +
        `<input id="swal-input7" class="swal2-input" placeholder="Local Govt">` +
        `<input id="swal-input8" class="swal2-input" placeholder="Town">` +
        `<input id="swal-input9" class="swal2-input" placeholder="State of Residence">` +
        `<input id="swal-input10" class="swal2-input" placeholder="Mother's Name">` +
        `<input id="swal-input11" class="swal2-input" placeholder="Mother's Surname">` +
        `<input id="swal-input12" class="swal2-input" placeholder="State of Origin">` +
        `<input id="swal-input13" class="swal2-input" placeholder="Local Govt (Origin)">` +
        `<input id="swal-input14" class="swal2-input" placeholder="NIN">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Submit",
      confirmButtonColor: "#044c6c",
      cancelButtonColor: "#00c4cc",
      preConfirm: () => {
        return {
          firstName: document.getElementById("swal-input1").value,
          middleName: document.getElementById("swal-input2").value,
          lastName: document.getElementById("swal-input3").value,
          dateOfBirth: document.getElementById("swal-input4").value,
          phoneNumber: document.getElementById("swal-input5").value,
          homeAddress: document.getElementById("swal-input6").value,
          localGovt: document.getElementById("swal-input7").value,
          town: document.getElementById("swal-input8").value,
          stateOfResidence: document.getElementById("swal-input9").value,
          mothersName: document.getElementById("swal-input10").value,
          mothersSurname: document.getElementById("swal-input11").value,
          stateOfOrigin: document.getElementById("swal-input12").value,
          localGovtOrigin: document.getElementById("swal-input13").value,
          nin: document.getElementById("swal-input14").value,
          dataModificationType,
          service: "Data Modification",
          phone: userData.phone,
          name: userData.name,
        };
      },
    });

    if (formValues) {
      // alert user to wait while processing
      Swal.fire({
        title: "Processing!",
        html: "Please wait while we process your request...",
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const fetchOptions = {
        method: "post",
        body: JSON.stringify(formValues),
        headers: new Headers({
          "Content-Type": "application/json",
        }),
      };
      fetch("http://localhost:5000/data-modification", fetchOptions)
        .then((res) => {
          res.json().then((data) => {
            if (res.ok) {
              Swal.fire({
                position: "center",
                icon: "success",
                title: "Request sent",
                text: `${data.message}`,
                showConfirmButton: true,
                confirmButtonColor: "#044c6c",
              });
            } else {
              Swal.fire({
                position: "center",
                icon: "error",
                title: "We had an issue!",
                text: `${data.message}`,
                footer: "Please contact Admin",
                showConfirmButton: true,
                confirmButtonColor: "#044c6c",
              });
            }
          });
        })
        .catch((err) => {
          alert("An unexpected error occurred");
          console.log(err);
          reject(err);
        });
    }
  }
}
